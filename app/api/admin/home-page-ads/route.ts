import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import HomePageAds from "@/models/HomePageAds";


const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

// export async function POST(req: NextRequest) {
//   await connectDB();
//   const cookieStore = await cookies();    
//   const refreshToken = cookieStore.get("refreshToken");
  
// //   if (!refreshToken) {
// //     return NextResponse.json({ message: "Unauthorized: No refresh token found" }, { status: 401 });
// //   }
  
//   try {
//     // const decoded = jwt.verify(refreshToken.value, REFRESH_TOKEN_SECRET);
//     // if (!decoded) {
//     //   return NextResponse.json({ message: "Unauthorized: Invalid refresh token" }, { status: 401 });
//     // }
  
//     const body = await req.json();
//     const homePageAds = new HomePageAds({
//       images: body.images,
//     });
  
//     // Validate the request body
//     if (!body.images || !Array.isArray(body.images)) {
//       return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
//     }
  
//     // Save the HomePageAds document
//     await homePageAds.save();
  
//     // Return the created HomePageAds document
//     return NextResponse.json(homePageAds, { status: 201 });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         message: "Internal server error",
//         error: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }





export async function POST(req:NextRequest) {
    try {
    await connectDB();

      const body = await req.json();
      const homePageAds = new HomePageAds({
        images: body.images,
      });
  
      // Validate the request body
      if (!body.images || !Array.isArray(body.images)) {
        return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
      }
  
      // Save the HomePageAds document
      await homePageAds.save();
  
      // Return the created HomePageAds document
      return NextResponse.json(homePageAds, { status: 201 });
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