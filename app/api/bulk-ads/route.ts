// app/api/bulk-upload-ads/route.ts
import connectDB from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Ad from "@/models/ad";
import User from "@/models/user";
import * as XLSX from 'xlsx';

interface ExcelAdData {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  mainCategory: string;
  subCategory?: string;
  subCategory2?: string; // Already optional
  latitude?: number;
  longitude?: number;
  showAllStates?: boolean;
}

interface BulkUploadResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  successfulAds: string[];
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file" },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse Excel/CSV file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (jsonData.length === 0) {
      return NextResponse.json(
        { message: "No data found in the uploaded file" },
        { status: 400 }
      );
    }

    const result: BulkUploadResult = {
      totalRows: jsonData.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      successfulAds: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const rowData = jsonData[i];
      const rowNumber = i + 2; // +2 because Excel rows start from 1 and we skip header

      try {
        // Validate required fields
        const validationError = validateRowData(rowData, rowNumber);
        if (validationError) {
          result.errors.push(validationError);
          result.errorCount++;
          continue;
        }

        // Prepare ad data
        const adData: any = {
          userId: userId,
          title: rowData.title?.toString().trim(),
          description: rowData.description?.toString().trim(),
          address: rowData.address?.toString().trim(),
          city: rowData.city?.toString().trim(),
          state: rowData.state?.toString().trim(),
          pincode: rowData.pincode?.toString().trim(),
          mobile: rowData.mobile?.toString().trim(),
          mainCategory: rowData.mainCategory?.toString().trim(),
          subCategory: rowData.subCategory?.toString().trim() || null,
          subCategory2: rowData.subCategory2?.toString().trim() || null, // Explicitly handle as optional
          showAllStates: rowData.showAllStates === true || rowData.showAllStates === 'true' || rowData.showAllStates === 1,
          status: 'active',
          images: [], // Empty array for bulk upload, images can be added later
          createdAd: new Date(),
          updatedAd: new Date()
        };

        // Add location if latitude and longitude are provided
        if (rowData.latitude && rowData.longitude) {
          const lat = parseFloat(rowData.latitude.toString());
          const lng = parseFloat(rowData.longitude.toString());
          
          if (!isNaN(lat) && !isNaN(lng)) {
            adData.location = {
              type: "Point",
              coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
            };
          }
        }

        // Create and save the ad
        const newAd = new Ad(adData);
        const savedAd = await newAd.save();
        
        result.successfulAds.push(savedAd._id.toString());
        result.successCount++;

      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : String(error),
          data: rowData
        });
        result.errorCount++;
      }
    }

    return NextResponse.json(
      {
        message: "Bulk upload completed",
        result: result
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      {
        message: "Internal server error during bulk upload",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function validateRowData(rowData: any, rowNumber: number): { row: number; error: string; data?: any } | null {
  // Updated required fields - subCategory2 is NOT included as it's optional
  const requiredFields = ['title', 'description', 'address', 'city', 'state', 'pincode', 'mobile', 'mainCategory'];
  
  for (const field of requiredFields) {
    if (!rowData[field] || rowData[field].toString().trim() === '') {
      return {
        row: rowNumber,
        error: `Missing required field: ${field}`,
        data: rowData
      };
    }
  }

  // Validate mobile number (basic validation)
  const mobile = rowData.mobile?.toString().trim();
  if (mobile && !/^\d{10}$/.test(mobile.replace(/[^\d]/g, ''))) {
    return {
      row: rowNumber,
      error: 'Invalid mobile number format',
      data: rowData
    };
  }

  // Validate pincode
  const pincode = rowData.pincode?.toString().trim();
  if (pincode && !/^\d{6}$/.test(pincode)) {
    return {
      row: rowNumber,
      error: 'Invalid pincode format (should be 6 digits)',
      data: rowData
    };
  }

  return null;
}