// pages/api/ads/nearby.js or similar path
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ad from "@/models/ad";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Ensure index exists
    try {
      await Ad.collection.createIndex({ location: "2dsphere" });
      console.log("Geospatial index created or already exists");
    } catch (indexError) {
      console.error("Error ensuring index:", indexError);
    }
    
    // Extract URL search parameters
    const url = new URL(req.url);
    const longitude = url.searchParams.get("longitude");
    const latitude = url.searchParams.get("latitude");
    const radius = url.searchParams.get("radius") || "10"; // Default 10km
    const categories = url.searchParams.get("categories");
    const status = url.searchParams.get("status") || "active";
    
    // Validate required parameters
    if (!longitude || !latitude) {
      return NextResponse.json({ 
        success: false, 
        message: "Longitude and latitude are required" 
      }, { status: 400 });
    }
    
    // Convert string parameters to numbers
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const radiusInKm = Math.min(Math.max(parseFloat(radius), 1), 100); // Limit between 1-100km
    
    // Build query
    const query: any = {
      status: status
    };
    
    // Add geospatial query
    query.location = {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    };
    
    // Add category filter if provided
    if (categories) {
      const categoryIds = categories.split(",");
      query.$or = [
        { "mainCategory._id": { $in: categoryIds } },
        { "subCategory._id": { $in: categoryIds } },
        { "subCategory2._id": { $in: categoryIds } }
      ];
    }
    
    // Execute query
    const ads = await Ad.find(query)
      .select("-__v")
      .sort({ createdAd: -1 })
      .lean();
    
    // Calculate distance for each ad
    const adsWithDistance = ads.map(ad => {
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        lat,
        lng,
        ad.location.coordinates[1],
        ad.location.coordinates[0]
      );
      
      return {
        ...ad,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        distanceText: `${Math.round(distance * 10) / 10} km away`
      };
    });
    
    return NextResponse.json({
      success: true,
      count: adsWithDistance.length,
      data: adsWithDistance
    });
    
  } catch (error) {
    console.error("Error in nearby ads API:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error", 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Helper function to calculate distance between coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}