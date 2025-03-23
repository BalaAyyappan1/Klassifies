"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AdImage {
  url?: string;
  key?: string;
  downloadUrl?: string;
}

interface HomePageAd {
  _id: string;
  link?: string;
  images: (string | AdImage)[];
  createdAt?: string;
  updatedAt?: string;
  createdAd?: Date;
}

const HomePageAds = () => {
  const [ads, setAds] = useState<HomePageAd[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [adLink, setAdLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch existing ads on component mount
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/home-page-ads');
      console.log("Fetched ads:", response.data); // Log to see the structure
      setAds(response.data);
    } catch (error) {
      console.error('Error fetching home page ads:', error);
      toast.error('Failed to load home page ads');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const uploadFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast.error('Please select at least one image to upload');
      return;
    }

    // Validate link format if provided
    if (adLink && !isValidUrl(adLink)) {
      toast.error('Please enter a valid URL (e.g., https://google.com)');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('file', file);
      });
      
      // Add the link to the form data if provided
      if (adLink) {
        formData.append('link', adLink);
      }
      
      await axios.post('/api/admin/home-page-ads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Clear the file input, link field, and refresh the ads list
      setFiles([]);
      setAdLink('');
      fetchAds();
      toast.success('Ad uploaded successfully');
    } catch (error) {
      console.error('Error uploading ad:', error);
      toast.error('Failed to upload ad');
    } finally {
      setUploading(false);
    }
  };

  // Helper function to validate URL format
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Safe function to extract filename from key
  const safeGetFilename = (key?: string): string => {
    if (!key) return "unknown-file";
    
    // Split safely and get the last part
    const parts = key.split('/');
    return parts.length > 0 ? parts[parts.length - 1] : "unknown-file";
  };

  // Safe function to check if a value is a base64 image string
  const isBase64Image = (value: any): boolean => {
    return typeof value === 'string' && 
           value.startsWith('data:image/') && 
           value.includes('base64,');
  };

  // Get formatted date from either createdAt or createdAd
  const getFormattedDate = (ad: HomePageAd): string => {
    if (ad.createdAt) {
      return new Date(ad.createdAt).toLocaleString();
    } else if (ad.createdAd) {
      return new Date(ad.createdAd).toLocaleString();
    }
    return "Unknown date";
  };

  // Create a download URL for base64 images
  const createDownloadLink = (base64Image: string, index: number): string => {
    try {
      const blob = base64ToBlob(base64Image);
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Error creating download link:", e);
      return '#';
    }
  };

  // Convert base64 to Blob for download
  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Home Page Ads Management</h1>
      
      {/* Upload Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Ad</h2>
        <form onSubmit={uploadFiles} className="space-y-4">
          {/* Link input field */}
          <div className="mb-4">
            <label htmlFor="ad-link" className="block text-sm font-medium text-gray-700 mb-1">
              Ad Link
            </label>
            <input
              type="url"
              id="ad-link"
              placeholder="https://example.com"
              value={adLink}
              onChange={(e) => setAdLink(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the URL where users will be directed when they click on the ad.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              Select Images
            </label>
            
            {files.length > 0 && (
              <div className="mt-4">
                <p>{files.length} file(s) selected:</p>
                <ul className="text-left mt-2">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {uploading ? 'Uploading...' : 'Upload Ad'}
          </button>
        </form>
      </div>
      
      {/* Display existing ads */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Ad Images</h2>
        
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : ads.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No ad images found</p>
        ) : (
          <div className="space-y-8">
            {ads.map((ad) => (
              <div key={ad._id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                  <div className="text-sm text-gray-500">
                    Created: {getFormattedDate(ad)}
                  </div>
                  {ad.link && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Ad Link:</span>
                      <a 
                        href={ad.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline truncate max-w-xs"
                        title={ad.link}
                      >
                        {ad.link}
                      </a>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ad.images.map((image, index) => {
                    // Handle both base64 image strings and image objects
                    if (isBase64Image(image)) {
                      // This is a base64 image string
                      const downloadUrl = createDownloadLink(image as string, index);
                      const filename = `ad-image-${index + 1}.jpg`;
                      
                      return (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <img
                            src={image as string}
                            alt={`Ad image ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-2 flex justify-between items-center">
                            <a
                              href={downloadUrl}
                              download={filename}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              onClick={(e) => {
                                // Create a temporary download link
                                const link = document.createElement('a');
                                link.href = downloadUrl;
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                // Revoke the object URL to free memory
                                URL.revokeObjectURL(downloadUrl);
                              }}
                            >
                              Download
                            </a>
                            <span className="text-xs text-gray-500">
                              Image {index + 1}
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      // This is an image object with url, key, downloadUrl properties
                      const imageObj = image as AdImage;
                      return (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          {imageObj.url && (
                            <img
                              src={imageObj.url}
                              alt={`Ad image ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-2 flex justify-between items-center">
                            {imageObj.downloadUrl && (
                              <a
                                href={imageObj.downloadUrl}
                                download
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Download
                              </a>
                            )}
                            <span className="text-xs text-gray-500 truncate" title={imageObj.key}>
                              {safeGetFilename(imageObj.key)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePageAds;
