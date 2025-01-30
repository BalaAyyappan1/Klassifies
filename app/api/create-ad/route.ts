import connectDB from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { uploadToR2 } from "@/lib/r2";
import Ad from "@/models/ad";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken");

    if (!refreshToken) {
      return NextResponse.json(
        { message: "unAuthorized: No refresh token found" },
        { status: 401 }
      );
    }
    try {
      const decoded = jwt.verify(refreshToken.value, REFRESH_TOKEN_SECRET) as {
        userId: string;
        email: string;
      };

      const userId = decoded.userId;
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "No file Provided" },
          { status: 400 }
        );
      }

      // Upload the file to R2
      // const uniqueFileName = `${userId}/${Date.now()}-${Math.random()
      //   .toString(36)
      //   .substring(2)}.${file.name.split(".").pop()}`;
      // const fileBuffer = Buffer.from(await file.arrayBuffer());
      // const fileUrl = await uploadToR2(uniqueFileName, fileBuffer, file.type);

      // Extract the data from the request body
      const body = JSON.parse(formData.get("data") as string);

      const newAd = new Ad({
        userId: decoded.userId,
        title: body.title,
        description: body.description,
        mainCategory: body.mainCategory,
        subCategory: body.subCategory,
        subCategory2: body.subCategory2,
        images: body.images,

        mobile: body.mobile,
        address: body.address,
        pincode: body.pincode,
        city: body.city,
        state: body.state,

        status: body.status,
        showAllStates: body.showAllStates,
      });

      await newAd.save();
      return NextResponse.json(
        {
          message: "Ad created successfully",
          ad: newAd,
        },
        { status: 201 }
      );
    } catch (error) {
      // Handle invalid or expired refresh token
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
