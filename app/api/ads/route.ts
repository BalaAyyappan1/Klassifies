// app/api/filter-ads/route.ts
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Ad from "@/models/ad";
import User from "@/models/user";
import { getFromR2 } from "@/lib/r2";
import { Buffer } from 'buffer';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { mainCategoryName, subCategory1Name, subCategory2Name } = await req.json();
    const filter: any = {};
  
    // Only add to the filter if the name is provided
    if (mainCategoryName !== undefined && mainCategoryName !== null) {
      filter.mainCategory = mainCategoryName; // Assuming mainCategory is stored as a string
    }
    if (subCategory1Name !== undefined && subCategory1Name !== null) {
      filter.subCategory = subCategory1Name; // Assuming subCategory is stored as a string
    }
    if (subCategory2Name !== undefined && subCategory2Name !== null) {
      filter.subCategory2 = subCategory2Name; // Assuming subCategory2 is stored as a string
    }

    // Query the database for ads that match the filter and sort by createdAd in descending order
    const ads = await Ad.find(filter)
      .sort({ createdAd: -1 }); // Sort by createdAd in descending order

    // Map ads to include user profile information
    const adsWithUserProfiles = await Promise.all(ads.map(async (ad) => {
      const userProfile = await User.findById(ad.userId).select("name profile");

      const extractKeyFromUrl = (url: string | URL) => {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.slice(1);
        const bucketName = process.env.R2_BUCKET_NAME;
        const key = pathname.replace(`${bucketName}/`, "");
        return key;
      };
  
      let images = [];
      if (ad.images && Array.isArray(ad.images)) {
        for (const imageUrl of ad.images) {
          const key = extractKeyFromUrl(imageUrl);
          const imageBuffer = await getFromR2(key);
          images.push(`data:image/jpeg;base64,${imageBuffer.toString('base64')}`);
        }
      }
      

      return { 
        _id: ad._id,
        userId: ad.userId,
        title: ad.title,
        description: ad.description,
        images: images || [], // Ensure images are in an array
        location: ad.location,
        address: ad.address,
        city: ad.city,
        state: ad.state,
        pincode: ad.pincode,
        mobile: ad.mobile,
        mainCategory: ad.mainCategory,
        subCategory: ad.subCategory,
        subCategory2: ad.subCategory2,
        status: ad.status,
        createdAd: ad.createdAd,
        updatedAd: ad.updatedAd,
        showAllStates: ad.showAllStates,
        userProfile: {
          name: userProfile?.name,
          profilePhoto: userProfile?.profile // Include user profile photo
        }
      };
    }));

    return NextResponse.json(
      {
        message: "Ads retrieved successfully",
        ads: adsWithUserProfiles,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}