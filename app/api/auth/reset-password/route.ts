import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET as string;
console.log("Reset Token",RESET_TOKEN_SECRET);

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    // Parse incoming request body
    const { newPassword, token } = await req.json();

    // Check if the required fields are present
    if (!newPassword || !token) {
      return NextResponse.json(
        { message: "New password and token are required" },
        { status: 400 }
      );
    }

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, RESET_TOKEN_SECRET) as { email: string; userId: string };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { message: "Token has expired. Please request a new password reset link." },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { message: "Invalid token. Please request a new password reset link." },
          { status: 400 }
        );
      }
    }

    // Find the user by userId and email from the decoded token
    const user = await User.findOne({ _id: decoded.userId, email: decoded.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Hash the new password and save it to the user's record
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Return success response
    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error during password reset:", error);

    // Return error response
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error), // Capture error message or string
      },
      { status: 500 }
    );
  }
}
