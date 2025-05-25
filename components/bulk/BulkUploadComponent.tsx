"use client";
import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, User } from 'lucide-react';
import AdminSidebar from '../Admin/AdminSidebar';
import AdminLayout from '../Admin/AdminLayout';

interface ErrorData {
  title?: string;
  mobile?: string;
  [key: string]: any; // Allow any additional properties from the API
}

interface UploadError {
  row: number;
  error: string;
  data?: ErrorData;
}

interface UploadResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: UploadError[];
  successfulAds: string[];
}

interface ApiResponse {
  message: string;
  result: UploadResult;
}

const BulkUploadAds: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setShowResults(false);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!file || !userId.trim()) {
      alert('Please provide User ID and select a file');
      return;
    }

    setUploading(true);
    
    try {
      // Create FormData to send file and userId to API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId.trim());

      // Call your actual API endpoint
      const response = await fetch('/api/bulk-ads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      setResult(data.result);
      setShowResults(true);
      
      // Show success message
      if (data.result.successCount > 0) {
        console.log(`Successfully created ${data.result.successCount} ads for user: ${userId}`);
        alert(`Success! ${data.result.successCount} ads created successfully.`);
      }

      if (data.result.errorCount > 0) {
        console.warn(`${data.result.errorCount} rows had errors.`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Upload failed:', error);
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (): void => {
    // Create sample CSV template with subCategory2 clearly marked as optional
    const templateData = [
      'title,description,address,city,state,pincode,mobile,mainCategory,subCategory,subCategory2,latitude,longitude,showAllStates',
      '"iPhone 14 Pro Max","Latest iPhone with amazing camera","123 Tech Street","Mumbai","Maharashtra","400001","9876543210","Electronics","Mobile Phones","Smartphones","19.0760","72.8777","false"',
      '"Honda City 2023","Well maintained Honda City","456 Car Lane","Delhi","Delhi","110001","9876543211","Vehicles","Cars","","28.7041","77.1025","false"',
      '"2BHK Apartment","Spacious 2BHK with all amenities","789 Home Avenue","Bangalore","Karnataka","560001","9876543212","Real Estate","Residential","","12.9716","77.5946","false"'
    ].join('\n');

    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ads_bulk_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFile = (): void => {
    setFile(null);
    setResult(null);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AdminLayout>
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
          Bulk Upload Ads
        </h1>
        <p className="text-gray-600">Upload multiple ads at once using Excel or CSV files</p>
      </div>

      {/* User ID Input */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <User className="inline w-4 h-4 mr-1" />
          User ID (Required)
        </label>
        <input
          type="text"
          value={userId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
          placeholder="Enter the User ID for all ads"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          All ads in the upload will be assigned to this User ID
        </p>
      </div>

      {/* Template Download */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Download Template</h3>
        <p className="text-blue-700 text-sm mb-3">
          Download the template file to see the required format and sample data for bulk upload.
        </p>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </button>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-700 mb-2">
              Click to upload your file
            </p>
            <p className="text-sm text-gray-500">
              Supports Excel (.xlsx, .xls) and CSV files • Max size: 10MB
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center justify-between border border-green-200">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="mb-6">
        <button
          onClick={handleUpload}
          disabled={!file || !userId.trim() || uploading}
          className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 text-lg"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Upload...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload and Create Ads
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {showResults && result && (
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
            <h3 className="font-semibold text-lg">📊 Upload Results</h3>
            <p className="text-blue-100 text-sm">User ID: {userId}</p>
          </div>
          
          <div className="p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">{result.totalRows}</div>
                <div className="text-sm font-medium text-blue-800">Total Rows</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-1">{result.successCount}</div>
                <div className="text-sm font-medium text-green-800">Ads Created</div>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                <div className="text-3xl font-bold text-red-600 mb-1">{result.errorCount}</div>
                <div className="text-sm font-medium text-red-800">Errors</div>
              </div>
            </div>

            {/* Success Message */}
            {result.successCount > 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-lg">
                    🎉 Successfully created {result.successCount} ads!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    All ads have been assigned to User ID: <span className="font-mono font-semibold">{userId}</span>
                  </p>
                  <p className="text-sm text-green-700">
                    The ads are now active and visible in the system.
                  </p>
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800 text-lg mb-2">
                      ⚠️ Errors in {result.errors.length} rows:
                    </p>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {result.errors.map((error, index) => (
                    <div key={index} className="p-4 bg-white border border-red-200 rounded-lg">
                      <p className="font-semibold text-red-800 mb-1">Row {error.row}:</p>
                      <p className="text-red-700 text-sm">{error.error}</p>
                      {error.data && error.data.title && (
                        <p className="text-gray-600 text-xs mt-1">
                          Ad Title: {error.data.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
        <h4 className="font-semibold text-yellow-800 mb-3 text-lg">📝 Important Guidelines:</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-yellow-800 mb-2">Required Fields:</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Title (ad headline)</li>
              <li>• Description (detailed info)</li>
              <li>• Address, City, State</li>
              <li>• Pincode (6 digits)</li>
              <li>• Mobile (10 digits)</li>
              <li>• Main Category</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-yellow-800 mb-2">Optional Fields:</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Sub Category</li>
              <li>• <strong>Sub Category 2</strong> (completely optional)</li>
              <li>• Latitude, Longitude (for mapping)</li>
              <li>• Show All States (true/false)</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> All ads will be created under the single User ID you specify above. 
            Images can be added individually after bulk upload is complete. The <strong>subCategory2</strong> field 
            is completely optional and can be left empty in your spreadsheet.
          </p>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default BulkUploadAds;