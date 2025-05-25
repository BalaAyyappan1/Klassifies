// app/api/filter-ads/route.ts
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Ad from "@/models/ad";
import User from "@/models/user";
import { getFromR2 } from "@/lib/r2";


export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { 
      mainCategoryName, 
      subCategory1Name, 
      subCategory2Name,
      latitude,
      longitude,
      radius // in kilometers
    } = await req.json();

    const filter: any = {};

    // Category filtering
    if (mainCategoryName !== undefined && mainCategoryName !== null) {
      filter.mainCategory = mainCategoryName;
    }
    if (subCategory1Name !== undefined && subCategory1Name !== null) {
      filter.subCategory = subCategory1Name;
    }
    if (subCategory2Name !== undefined && subCategory2Name !== null) {
      filter.subCategory2 = subCategory2Name;
    }

    // Geolocation filtering (only applied if all required params are present)
    if (latitude !== undefined && longitude !== undefined && radius !== undefined) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    // Query the database for ads that match the filter
    const ads = await Ad.find(filter).sort({ createdAd: -1 });

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
      
      const images = [];
      if (ad.images && Array.isArray(ad.images)) {
        for (const imageUrl of ad.images) {
          const key = extractKeyFromUrl(imageUrl);
          const imageBuffer = await getFromR2(key);
          images.push(`data:image/jpeg;base64,${imageBuffer.toString('base64')}`);
        }
      }
      
      return {
        id: ad._id,
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
          profilePhoto: userProfile?.profile 
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