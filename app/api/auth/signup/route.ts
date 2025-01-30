import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user";
import OTP from "@/models/otp";
import { sendEmailOtp } from "@/utils/sendEmailOtp";
import { generateOtp } from "@/utils/generateOtp";
import { sendWelcomeMail } from "@/utils/sendWelcomeMail";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const GEOLOCATION_API_URL = process.env.GEOLOCATION_API_URL;
const GEOLOCATION_API_KEY = process.env.GEOLOCATION_API_KEY;

const validateEnvVariables = () => {
  if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error("Missing required environment variables.");
  }
};

export async function POST(req: NextRequest) {
  try {
    validateEnvVariables();

    await connectDB();

    const { name, email, phoneNumber, emailOtp, password, profile } =
      await req.json();

    if (!emailOtp) {
      const missingFields: string[] = [];

      if (!name) missingFields.push("name");
      if (!email) missingFields.push("email");
      if (!phoneNumber) missingFields.push("phoneNumber");
      if (!password) missingFields.push("password");

      if (missingFields.length > 0) {
        return NextResponse.json(
          { message: `Missing required fields: ${missingFields.join(", ")}` },
          { status: 422 }
        );
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: "User already exists" },
          { status: 400 }
        );
      }

      await OTP.deleteMany({ email });

      const otp = generateOtp();

      const expiryDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
      const newOTP = new OTP({
        email,
        otp,
        expiresAt: expiryDate,
      });
      await newOTP.save();

      // Send OTP via email
      await sendEmailOtp(email, otp, name);

      return NextResponse.json(
        {
          message: "OTP sent successfully",
          otpSent: true,
        },
        { status: 200 }
      );
    }

    if (emailOtp) {
      const storedOtp = await OTP.findOne({
        email,
        otp: emailOtp,
      });

      if (!storedOtp) {
        return NextResponse.json(
          { message: "Invalid or expired OTP" },
          { status: 400 }
        );
      }

      if (storedOtp.expiresAt < new Date()) {
        // Remove expired OTP
        await OTP.deleteOne({ email, otp: emailOtp });
        return NextResponse.json(
          { message: "OTP has expired" },
          { status: 400 }
        );
      }

      // Extract IP address from headers
      const ipAddress =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("remote-addr") ||
        "IP address not available";

      console.log("Raw IP Address:", ipAddress);
      console.log("IP Address from x-forwarded-for:", req.headers.get("x-forwarded-for"));
      console.log("IP Address from remote-addr:", req.headers.get("remote-addr"));


      console.log("Sanitized IP Address:", ipAddress);

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
            console.log("Location Data:", location);
          }
        } catch (locationError) {
          console.error("Failed to fetch location data:", locationError);
        }
      }

      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        isVerified: true,
        profile,
        ipAddress,
        location,
      });

      await newUser.save();

      // Generate access and refresh tokens
      const accessToken = jwt.sign(
        {
          userId: newUser._id,
          email: newUser.email,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        {
          userId: newUser._id,
          email: newUser.email,
        },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
      );

      // Create response with user data and access token
      const response = NextResponse.json(
        {
          message: "User created successfully",
          user: {
            name: newUser.name,
            email: newUser.email,
            phoneNumber: newUser.phoneNumber,
            role: newUser.role,
            profile: newUser.profile,
            isBlocked: newUser.isBlocked,
          },
          accessToken,
        },
        { status: 201 }
      );

      // Set refresh token in HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set({
        name: "refreshToken",
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: "lax",
        priority: "high",
      });

      // Remove the used OTP
      await OTP.deleteOne({ email, otp: emailOtp });

      // Send welcome email
      await sendWelcomeMail(email, name);

      return response;
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
