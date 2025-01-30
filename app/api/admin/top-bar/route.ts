import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import TopBar from "@/models/topbar";


const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;


export async function GET() {
  try {
    await connectDB(); // Connect to the databas

    const topBars = await TopBar.find({});
    // Return the top bars as a JSON response
    return NextResponse.json(topBars, { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the process
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}



export async function POST(req: NextRequest) {
    await connectDB();
    const cookieStore = await cookies();    
    const refreshToken = cookieStore.get("refreshToken");
  
    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized: No refresh token found" }, { status: 401 });
    }
  
    try {
      const decoded = jwt.verify(refreshToken.value, REFRESH_TOKEN_SECRET);
      if (!decoded) {
        return NextResponse.json({ message: "Unauthorized: Invalid refresh token" }, { status: 401 });
      }
  
      const body = await req.json();
      const newTopBar = new TopBar({
        adName: body.adName,
        textColor: body.textColor,
        bgColor: body.bgColor,
        fontSize: body.fontSize,
        link: body.link,
      });
  
      await newTopBar.save();
      return NextResponse.json(newTopBar, { status: 201 });
  
    }  catch (error) {
        return NextResponse.json(
          {
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }


    export async function DELETE(req: NextRequest) {
        await connectDB();
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken');
      
        if (!refreshToken) {
          return NextResponse.json({ message: 'Unauthorized: No refresh token found' }, { status: 401 });
        }
      
        try {
          const decoded = jwt.verify(refreshToken.value, REFRESH_TOKEN_SECRET);
          if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized: Invalid refresh token' }, { status: 401 });
          }
      
          const { _id } = await req.json();
          await TopBar.findByIdAndDelete(_id);
          return NextResponse.json({ message: 'Top bar deleted successfully' }, { status: 200 });
      
        } catch (error) {
          return NextResponse.json(
            {
              message: 'Internal server error',
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
          );
        }
        }      