import { google } from "googleapis";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/user";
import { cookies } from "next/headers";
import { sendWelcomeMail } from "@/utils/sendWelcomeMail";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Send welcome email only for new users
      await sendWelcomeMail(user.email, user.firstName);
    } else {
      // Update existing user
      existingUser.name = name;
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