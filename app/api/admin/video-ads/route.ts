import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import HomePageVideo from "@/models/Video";
import { uploadToR2, getVideoFromR2, streamVideoFromR2, getVideoContentType } from "@/lib/r2";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Authentication check
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken");
  
    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized: No refresh token found" }, { status: 401 });
    }
  
    try {
      const decoded = jwt.verify(refreshToken.value, REFRESH_TOKEN_SECRET) as {
        userId: string;
        email: string;
      };
      
      const formData = await req.formData();
      
      // Get the uploaded video file
      const videoFile = formData.get("video") as File;
      const link = formData.get("link") as string;
      
      if (!videoFile) {
        return NextResponse.json({ error: "No video file provided" }, { status: 400 });
      }
      
      // Convert file into buffer format for upload
      const arrayBuffer = await videoFile.arrayBuffer();
      const fileUpload = {
        key: `homepage-video/${Date.now()}-${Math.random().toString(36).substring(2)}.${videoFile.name.split(".").pop()}`,
        file: Buffer.from(arrayBuffer),
        mimeType: videoFile.type || `video/${videoFile.name.split(".").pop()}`,
      };
      
      // Upload video
      const videoUrl = await uploadToR2(fileUpload.key, fileUpload.file, fileUpload.mimeType);
      
      // Create new HomePageVideo document with the uploaded video URL
      const homePageVideo = new HomePageVideo({
        video: videoUrl,
        link: link || undefined,
      });
      
      // Save the HomePageVideo document
      await homePageVideo.save();
      
      // Return the created HomePageVideo document
      return NextResponse.json(homePageVideo, { status: 201 });
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

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get URL parameters
    const url = new URL(req.url);
    const download = url.searchParams.get('download');
    const stream = url.searchParams.get('stream');
    const videoKey = url.searchParams.get('key');
    
    // Check for range header for video streaming
    const rangeHeader = req.headers.get('range');
    
    // If video file is requested (download or stream)
    if ((download === 'true' || stream === 'true') && videoKey) {
      try {
        // For streaming with range support
        if (stream === 'true' && rangeHeader) {
          // Use our new streamVideoFromR2 function
          const { buffer, contentType, contentLength, contentRange } = await streamVideoFromR2(videoKey, rangeHeader);
          
          // Set headers for proper video streaming
          const headers: HeadersInit = {
            'Content-Type': contentType,
            'Content-Length': String(contentLength),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400',
          };
          
          // Add Content-Range header for range requests
          if (contentRange) {
            headers['Content-Range'] = contentRange;
          }
          
          // Return partial content status for range requests
          const status = contentRange ? 206 : 200;
          
          return new NextResponse(buffer, { status, headers });
        } 
        // For streaming without range (regular playback)
        else if (stream === 'true') {
          // Use our video-specific function
          const videoBuffer = await getVideoFromR2(videoKey);
          const contentType = getVideoContentType(videoKey);
          
          return new NextResponse(videoBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Length': String(videoBuffer.length),
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=86400',
            }
          });
        }
        // For downloads
        else if (download === 'true') {
          const videoBuffer = await getVideoFromR2(videoKey);
          const contentType = getVideoContentType(videoKey);
          const filename = videoKey.split('/').pop() || 'video';
          
          return new NextResponse(videoBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Length': String(videoBuffer.length),
            }
          });
        }
      } catch (error) {
        console.error('Error serving video:', error);
        return NextResponse.json(
          { message: "Failed to fetch video", error: String(error) },
          { status: 404 }
        );
      }
    }
    
    // Regular GET request to retrieve all videos
    const homePageVideos = await HomePageVideo.find({}).sort({ createdAt: -1 });
    
    // Get base URL for generating absolute URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    
    // Process videos to include streaming URLs
    const processedVideos = homePageVideos.map(video => {
      const videoObj = video.toObject();
      
      // Extract key from video URL using a more robust approach
      let videoKey = '';
      try {
        // Try to extract key using URL parsing
        const videoUrl = new URL(videoObj.video);
        const pathname = videoUrl.pathname.slice(1);
        const bucketName = process.env.R2_BUCKET_NAME || '';
        videoKey = pathname.replace(`${bucketName}/`, "");
      } catch (e) {
        // Fallback to simple string extraction if URL parsing fails
        videoKey = videoObj.video.split('/').slice(-2).join('/');
      }
      
      return {
        ...videoObj,
        key: videoKey,
        // Use explicit streaming endpoint
        streamUrl: `${baseUrl}/api/admin/video-ads?stream=true&key=${encodeURIComponent(videoKey)}`,
        downloadUrl: `${baseUrl}/api/admin/video-ads?download=true&key=${encodeURIComponent(videoKey)}`
      };
    });
    
    return NextResponse.json(processedVideos, { status: 200 });
  } catch (error) {
    console.error('Error in video GET API:', error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a video
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    // Authentication check
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken");
  
    if (!refreshToken) {
      return NextResponse.json({ message: "Unauthorized: No refresh token found" }, { status: 401 });
    }
  
    try {
      jwt.verify(refreshToken.value, REFRESH_TOKEN_SECRET);
      
      // Get the video ID from query parameters
      const url = new URL(req.url);
      const videoId = url.searchParams.get('id');
      
      if (!videoId) {
        return NextResponse.json({ error: "No video ID provided" }, { status: 400 });
      }
      
      // Find the video first to get its key
      const video = await HomePageVideo.findById(videoId);
      
      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
      
      // Try to extract the key to delete from R2 (optional)
      try {
        const videoUrl = video.video;
        let videoKey = '';
        
        try {
          // Try to extract key using URL parsing
          const urlObj = new URL(videoUrl);
          const pathname = urlObj.pathname.slice(1);
          const bucketName = process.env.R2_BUCKET_NAME || '';
          videoKey = pathname.replace(`${bucketName}/`, "");
        } catch (e) {
          // Fallback to simple string extraction
          videoKey = videoUrl.split('/').slice(-2).join('/');
        }
        
        if (videoKey) {
          // Delete the file from R2 (optional)
          try {
            const { deleteFromR2 } = await import('@/lib/r2');
            await deleteFromR2(videoKey);
            console.log(`Deleted video file: ${videoKey}`);
          } catch (deleteError) {
            console.error(`Warning: Could not delete file from R2: ${videoKey}`, deleteError);
            // Continue anyway - we still want to delete the database record
          }
        }
      } catch (extractError) {
        console.error('Warning: Error extracting video key for deletion:', extractError);
        // Continue anyway - we still want to delete the database record
      }
      
      // Delete the video record from the database
      await HomePageVideo.findByIdAndDelete(videoId);
      
      return NextResponse.json({ message: "Video deleted successfully" }, { status: 200 });
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
