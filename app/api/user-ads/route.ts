import connectDB from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Ad from "@/models/ad";
import User from "@/models/user";
import { getFromR2 } from "@/lib/r2";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken");

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Unauthorized: No refresh token found" },
        { status: 401 }
      );
    }

    try {
      // Decode the refresh token to get userId
      const decoded = jwt.verify(refreshToken.value, REFRESH_TOKEN_SECRET) as {
        userId: string;
        email: string;
      };

      // Fetch ads for the specific user
      const ads = await Ad.find({ userId: decoded.userId });
      const extractKeyFromUrl = (url: string | URL) => {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.slice(1);
        const bucketName = process.env.R2_BUCKET_NAME;
        const key = pathname.replace(`${bucketName}/`, "");
        return key;
      };

      // Format the ads response
      const formattedAds = await Promise.all(ads.map(async (ad) => {
        // Fetch user details for each ad
        const user = await User.findById(ad.userId).select("name profile");

        let images = null;
        if (ad.images) {
          const key = extractKeyFromUrl(ad.images);
          images = await getFromR2(key);
          
        }

        return {
          _id: ad._id,
          userId: ad.userId,
          title: ad.title,
          description: ad.description,
          images: images ? [images] : [], // Ensure images are in an array
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
          user: {
            name: user?.name,
            profile: user?.profile
          }
        };
      }));

      return NextResponse.json(
        {
          message: "Ads retrieved successfully",
          ads: formattedAds,
        },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        (await cookies()).delete("refreshToken");

        return NextResponse.json(
          { message: "Unauthorized: Invalid refresh token" },
          { status: 401 }
        );
      }
      throw error;
    }
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