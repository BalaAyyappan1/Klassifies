// app/api/search-ads/route.ts
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Ad from "@/models/ad";
import User from "@/models/user";
import { getFromR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchQuery } = await req.json();
    
    if (!searchQuery || searchQuery.trim() === '') {
      return NextResponse.json(
        { message: "Search query is required" },
        { status: 400 }
      );
    }
    
    // Create a case-insensitive regex search pattern
    const searchPattern = new RegExp(searchQuery, 'i');
    
    // Search in title, city, or state
    const filter = {
      $or: [
        { title: searchPattern },
        { city: searchPattern },
        { state: searchPattern }
      ]
    };
    
    // Query the database for ads matching the search criteria
    const ads = await Ad.find(filter).sort({ createdAd: -1 });
    
    // Map ads to include user profile information (same as in filter-ads route)
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
        _id: ad._id,
        userId: ad.userId,
        title: ad.title,
        description: ad.description,
        images: images || [],
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
      { message: "Search results retrieved successfully", ads: adsWithUserProfiles },
      { status: 200 }
    );
    
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}