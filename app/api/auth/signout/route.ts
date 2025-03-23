import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out successfully" });
  response.cookies.set("refreshToken", "", { path: "/", maxAge: 0, httpOnly: true });

  return response;
}