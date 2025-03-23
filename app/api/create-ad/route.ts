import connectDB from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { uploadMultipleToR2} from "@/lib/r2";
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

      // Get all uploaded files (important: handle multiple images)
      const files = formData.getAll("file") as File[];

      if (!files.length) {
        return NextResponse.json({ error: "No files provided" }, { status: 400 });
      }

      // Convert files into buffer format for upload
      const fileUploads = await Promise.all(files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          key: `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split(".").pop()}`,
          file: Buffer.from(arrayBuffer),
          mimeType: file.type,
        };
      }));

      // Upload multiple images
      const fileUrls = await uploadMultipleToR2(fileUploads);

      // Extract additional data from request
      const body = JSON.parse(formData.get("data") as string);

      const locationData = {
        type: "Point",
        coordinates: [body.longitude, body.latitude] // Ensure correct order
      };

      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify({ ...body, location: locationData }));

      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const newAd = new Ad({
        userId: decoded.userId,
        title: body.title,
        description: body.description,
        mainCategory: body.mainCategory,
        subCategory: body.subCategory,
        subCategory2: body.subCategory2,
        images: fileUrls,
        mobile: body.mobile,
        address: body.address,
        pincode: body.pincode,
        city: body.city,
        state: body.state,
        status: body.status,
        location: body.location,
        showAllStates: body.showAllStates,
      });
      console.log("New Ad Object:", newAd);
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
