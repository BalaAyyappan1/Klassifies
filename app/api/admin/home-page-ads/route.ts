import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import HomePageAds from "@/models/HomePageAds";
import { uploadMultipleToR2 } from "@/lib/r2";


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






export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Add authentication check like in other admin routes
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
      
      // Get all uploaded files
      const files = formData.getAll("file") as File[];
      
      if (!files.length) {
        return NextResponse.json({ error: "No files provided" }, { status: 400 });
      }
      
      // Get link from form data (if provided)
      const link = formData.get("link") as string || null;
      
      // Convert files into buffer format for upload
      const fileUploads = await Promise.all(files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          key: `homepage-ads/${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split(".").pop()}`,
          file: Buffer.from(arrayBuffer),
          mimeType: file.type,
        };
      }));
      
      // Upload multiple images
      const fileUrls = await uploadMultipleToR2(fileUploads);
      
      // Create new HomePageAds document with the uploaded image URLs and link
      const homePageAds = new HomePageAds({
        images: fileUrls,
        link: link, // Add the link to the document
      });
      
      // Save the HomePageAds document
      await homePageAds.save();
      
      // Return the created HomePageAds document
      return NextResponse.json(homePageAds, { status: 201 });
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



// ... existing code ...

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get URL parameters if needed
    const url = new URL(req.url);
    const download = url.searchParams.get('download');
    const imageKey = url.searchParams.get('key');
    
    // If download parameter is present and a key is provided, return the image file
    if (download === 'true' && imageKey) {
      try {
        const { downloadFromR2 } = await import('@/lib/r2');
        const imageBlob = await downloadFromR2(imageKey);
        
        // Convert Blob to ArrayBuffer
        const arrayBuffer = await imageBlob.arrayBuffer();
        
        // Determine content type based on file extension
        const extension = imageKey.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        
        if (extension === 'jpg' || extension === 'jpeg') {
          contentType = 'image/jpeg';
        } else if (extension === 'png') {
          contentType = 'image/png';
        } else if (extension === 'gif') {
          contentType = 'image/gif';
        } else if (extension === 'webp') {
          contentType = 'image/webp';
        }
        
        // Return the image file
        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${imageKey.split('/').pop()}"`,
          },
        });
      } catch (error) {
        return NextResponse.json(
          { message: "Failed to download image", error: String(error) },
          { status: 404 }
        );
      }
    }
    
    // Regular GET request to retrieve all home page ads
    const homePageAds = await HomePageAds.find({}).sort({ createdAt: -1 });
    
    // Extract and process images similar to the ads API
    const processedHomePageAds = await Promise.all(homePageAds.map(async (ad) => {
      const adObj = ad.toObject();
      
      // Extract images similar to the ads API
      const extractKeyFromUrl = (url: string | URL) => {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.slice(1);
        const bucketName = process.env.R2_BUCKET_NAME;
        const key = pathname.replace(`${bucketName}/`, "");
        return key;
      };
      
      // Process images if they exist - using the same approach as in ads API
      const images = [];
      if (adObj.images && Array.isArray(adObj.images)) {
        for (const imageUrl of adObj.images) {
          try {
            const key = extractKeyFromUrl(imageUrl);
            const { getFromR2 } = await import('@/lib/r2');
            const imageBuffer = await getFromR2(key);
            images.push(`data:image/jpeg;base64,${imageBuffer.toString('base64')}`);
          } catch (error) {
            console.error(`Error processing image ${imageUrl}:`, error);
            // Push a placeholder or error image if processing fails
            images.push(null);
          }
        }
      }
      
      // Replace the image URLs with base64 encoded images
      adObj.images = images;
      
      // Keep the original attributes
      return {
        ...adObj,
        originalImages: adObj.images, // Optionally keep original URLs if needed
      };
    }));
    
    return NextResponse.json(processedHomePageAds, { status: 200 });
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
