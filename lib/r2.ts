import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Initialize S3 client for Cloudflare R2
const r2Client = new S3Client({
  region: process.env.R2_REGION || "auto", 
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadToR2 = async (key: string, file: Buffer | Uint8Array | Blob | string, mimeType: string) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });

    await r2Client.send(command);
    return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${key}`;
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload file to R2.");
  }
};


export const uploadMultipleToR2 = async (files: { key: string; file: Buffer | Uint8Array | Blob | string; mimeType: string }[]) => {
  try {
    const uploadPromises = files.map(({ key, file, mimeType }) => uploadToR2(key, file, mimeType));
    const urls = await Promise.all(uploadPromises);
    return urls; // Returns an array of uploaded file URLs
  } catch (error) {
    console.error("Error uploading multiple files to R2:", error);
    throw new Error("Failed to upload multiple files to R2.");
  }
};


  
// Function to fetch a file and convert stream to a Buffer
// export const getFromR2 = async (key: string): Promise<Buffer> => {
//   try {
//     console.log('Key being passed to R2:', key);
//     const command = new GetObjectCommand({
//       Bucket: process.env.R2_BUCKET_NAME!,
//       Key: key,
//     });

//     const response = await r2Client.send(command);

//     const stream = response.Body as Readable;
//     // Convert stream to Buffer
//     const chunks: Buffer[] = [];
//     for await (const chunk of stream) {
//       chunks.push(chunk);
//     }

//     // Return the full buffer
//     return Buffer.concat(chunks);
//   } catch (error) {
//     console.error('Error fetching from R2:', error);
//     throw error;
//   }
// };
export const getFromR2 = async (key: string | string[]): Promise<Buffer | Buffer[]> => {
  try {
    console.log("Keys being passed to getFromR2:", key); // Log the keys being passed

    // If the key is an array, fetch all images and return an array of Buffers
    if (Array.isArray(key)) {
      const buffers = await Promise.all(
        key.map(async (k) => {
          console.log("Processing key:", k); // Log each individual key being processed

          const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: k,
          });

          const response = await r2Client.send(command);
          const stream = response.Body as Readable;

          // Convert stream to Buffer
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }

          return Buffer.concat(chunks);
        })
      );

      return buffers;
    }
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    const response = await r2Client.send(command);
    const stream = response.Body as Readable;

    // Convert stream to Buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error fetching from R2:', error);
    throw error;
  }
};
// Function to delete a file from Cloudflare R2 (optional, if you need to delete files)
export const deleteFromR2 = async (key: string): Promise<void> => {
  try {
    // Create the command to delete a file
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    // Send the command to delete the file
    await r2Client.send(command);
    console.log(`File with key ${key} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error("Failed to delete file from R2.");
  }
};

export const getR2ObjectMetadata = async (objectUrl:string)=> {
  try {
    const url = new URL(objectUrl)
    const bucketName = process.env.R2_BUCKET_NAME!
    const objectKey = decodeURIComponent(url.pathname.slice(1));
    console.log(objectKey);
    
    const command = new HeadObjectCommand({
      Bucket:bucketName,
      Key:objectKey
    })

    const metadata = await r2Client.send(command)

    return {
      contentType:  metadata.ContentType,
      contentLength : metadata.ContentLength,
      lastModified : metadata.LastModified,
      metadata : metadata.Metadata
    }
  } catch (error) {
    console.error("Error retrieving metadata:",error)
    throw error;
  }
}

export const downloadFromR2 = async (key: string): Promise<Blob> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      throw new Error('Response body is empty');
    }

    // Assuming response.Body is a ReadableStream
    const stream = response.Body as ReadableStream<Uint8Array>;
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    let done = false;
    while (!done) {
      const { value, done: streamDone } = await reader.read();
      if (value) {
        chunks.push(value);
      }
      done = streamDone;
    }

    // Combine chunks into a single Uint8Array
    const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert Uint8Array to Blob
    return new Blob([buffer], { type: response.ContentType || 'application/octet-stream' });
  } catch (error) {
    console.error('Error downloading from R2:', error);
    throw new Error('Failed to download file from R2.');
  }
};

// Video-specific functions

/**
 * Gets a video file from R2 storage
 * Optimized for handling larger video files
 */
export const getVideoFromR2 = async (key: string): Promise<Buffer> => {
  try {
    console.log("Fetching video with key:", key);

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    const response = await r2Client.send(command);
    const stream = response.Body as Readable;

    // Use a more memory-efficient approach for potentially large video files
    const chunks: Buffer[] = [];
    let totalSize = 0;
    
    for await (const chunk of stream) {
      chunks.push(chunk);
      totalSize += chunk.length;
    }

    console.log(`Video fetched successfully: ${key}, size: ${totalSize/1024/1024} MB`);
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error fetching video from R2:', error);
    throw error;
  }
};

/**
 * Determines the content type of a video based on its file extension
 */
export const getVideoContentType = (key: string): string => {
  const extension = key.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'mov':
      return 'video/quicktime';
    case 'avi':
      return 'video/x-msvideo';
    case 'mkv':
      return 'video/x-matroska';
    case 'flv':
      return 'video/x-flv';
    case 'wmv':
      return 'video/x-ms-wmv';
    case 'mpeg':
    case 'mpg':
      return 'video/mpeg';
    case 'ts':
      return 'video/mp2t';
    case '3gp':
      return 'video/3gpp';
    case 'ogv':
      return 'video/ogg';
    default:
      return 'video/mp4'; // Default to mp4 if unknown
  }
};

/**
 * Streams a video from R2 storage with support for range requests
 * Returns the video buffer and metadata needed for proper HTTP responses
 */
export const streamVideoFromR2 = async (
  key: string,
  range?: string
): Promise<{ buffer: Buffer; contentType: string; contentLength: number; contentRange?: string }> => {
  try {
    console.log(`Streaming video key: ${key}, Range: ${range || 'none'}`);
    
    // Get the object's metadata first to determine file size
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });
    
    let totalSize = 0;
    let rangeStart = 0;
    let rangeEnd = 0;
    let contentRange: string | undefined;
    
    try {
      const headResponse = await r2Client.send(headCommand);
      totalSize = headResponse.ContentLength || 0;
      
      // Process range header if provided
      if (range && totalSize > 0) {
        // Range header format: "bytes=start-end"
        const match = range.match(/bytes=(\d+)-(\d*)/);
        if (match) {
          rangeStart = parseInt(match[1], 10);
          rangeEnd = match[2] ? parseInt(match[2], 10) : totalSize - 1;
          
          // Ensure ranges are valid
          rangeEnd = Math.min(rangeEnd, totalSize - 1);
          
          // Create content range header
          contentRange = `bytes ${rangeStart}-${rangeEnd}/${totalSize}`;
          console.log(`Serving range: ${contentRange}`);
        }
      }
    } catch (error) {
      console.warn('Error getting object metadata, proceeding with full download:', error);
    }
    
    // Command for getting the object, potentially with range
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ...(contentRange ? { Range: `bytes=${rangeStart}-${rangeEnd}` } : {}),
    });

    const response = await r2Client.send(command);
    const stream = response.Body as Readable;
    
    // Determine content type
    const contentType = response.ContentType || getVideoContentType(key);
    
    // Read the stream into a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    console.log(`Video streaming completed: ${key}, chunk size: ${buffer.length/1024} KB`);
    
    return { 
      buffer, 
      contentType, 
      contentLength: buffer.length,
      contentRange
    };
  } catch (error) {
    console.error('Error streaming video from R2:', error);
    throw error;
  }
};