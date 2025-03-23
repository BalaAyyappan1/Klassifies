import { google } from "googleapis";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { cookies } from "next/headers";


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const GEOLOCATION_API_URL = process.env.GEOLOCATION_API_URL;
const GEOLOCATION_API_KEY = process.env.GEOLOCATION_API_KEY;

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-auth/callback`
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  try {
    // Connect to the database
    await connectDB();

    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    const { email, given_name: name } = googleUser;

    // Extract IP address from headers
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("remote-addr") ||
      "IP address not available";

    // Fetch location data from geolocation API
    let location = null;
    if (ipAddress !== "IP address not available") {
      try {
        const response = await fetch(
          `${GEOLOCATION_API_URL}/${ipAddress}?token=${GEOLOCATION_API_KEY}`
        );
        const data = await response.json();

        if (response.ok && data.loc) {
          const [latitude, longitude] = data.loc.split(",").map(Number);
          location = {
            type: "Point",
            coordinates: [longitude, latitude],
          };
        }
      } catch (locationError) {
        console.error("Failed to fetch location data:", locationError);
      }
    }

    // Check if user exists first
    const existingUser = await User.findOne({ email });
    const isNewUser = !existingUser;

    // Find or create user
    let user;
    if (isNewUser) {
      // Create new user
      user = await User.create({
        email,
        name,
        role: "user",
        isVerified: true,
        ipAddress,
        location,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      
    } else {
      // Update existing user
      existingUser.name = name;
      existingUser.ipAddress = ipAddress;
      existingUser.location = location;
      existingUser.updatedAt = new Date();
      user = await existingUser.save();
    }

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    // Create response with access token in body
    const response = NextResponse.redirect(new URL("/", req.url));
    response.headers.set("Authorization", `Bearer ${accessToken}`);

    // Set only refresh token in HTTP-only cookie
    (await cookies()).set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Google Sign-In Callback Error:", error);
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }
}