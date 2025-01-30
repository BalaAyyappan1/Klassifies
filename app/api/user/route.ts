import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { getFromR2 } from "@/lib/r2";
import User from "@/models/user";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;


export async function GET(req: NextResponse) {
  try {
    // Connect to the database
    await connectDB();

    // Get refresh token from cookies
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken");

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Unauthorized: No refresh token found" },
        { status: 401 }
      );
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken.value, REFRESH_TOKEN_SECRET) as {
        userId: string;
        email: string;
      };



      

      // Find user
      const user = await User.findOne({ email: decoded.email }).select(
        "name email phoneNumber role isBlocked isVerified profile ipAddress location createdAt updatedAt"
      );


      if (!user) {
        return NextResponse.json(
          { message: "Unauthorized: User not found" },
          { status: 401 }
        );
      }

      // Generate new access token
      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      //   const extractKeyFromUrl = (url: string | URL) => {
      //     const urlObj = new URL(url);
      //     const pathname = urlObj.pathname.slice(1);
      //     const bucketName = process.env.R2_BUCKET_NAME;
      //     const key = pathname.replace(`${bucketName}/`, "");
      //     return key;
      //   };

      //   let profile = null;
      //   if (user.companyLogo) {
      //     const key = extractKeyFromUrl(user.companyLogo);
      //     profile = await getFromR2(key);
      //   }

      //   console.log("Profile:", profile);

      // Create response with user data
      const response = NextResponse.json(
        {
          user: {
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isVerified: user.isVerified,
            isBlocked: user.isBlocked,
            role: user.role,
            profile: user.profile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        { status: 200 }
      );
      response.headers.set("Authorization", `Bearer ${accessToken}`);

      return response;
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
