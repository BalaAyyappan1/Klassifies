"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface HomePageVideoProps {
  _id: string;
  video: string;
  link?: string;
  streamUrl: string;
  downloadUrl: string;
  key: string;
  createdAt: string;
}

const HomePageVideo = () => {
  const [videos, setVideos] = useState<HomePageVideoProps[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/video-ads');
      console.log('Fetched videos:', response.data);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const uploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('Please select a video file to upload');
      return;
    }

    // Validate link format if provided
    if (videoLink && !isValidUrl(videoLink)) {
      toast.error('Please enter a valid URL (e.g., https://google.com)');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      formData.append('video', videoFile);
      
      // Add the link to the form data if provided
      if (videoLink) {
        formData.append('link', videoLink);
      }
      
      await axios.post('/api/admin/video-ads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Clear the form and refresh videos list
      setVideoFile(null);
      setVideoLink('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchVideos();
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`/api/admin/video-ads?id=${videoId}`);
      fetchVideos();
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    } finally {
      setLoading(false);
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

  // Get the file size in a readable format
  const getReadableFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Get formatted date
  const getFormattedDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Handle video load error
  const handleVideoError = (videoId: string) => {
    console.error(`Error loading video ${videoId}`);
    setVideoLoadError(prev => ({ ...prev, [videoId]: true }));
    
    // Try fallback to original URL if streamUrl fails
    const video = videos.find(v => v._id === videoId);
    if (video) {
      console.log(`Trying fallback URL for ${videoId}:`, video.video);
    }
  };

  // Get appropriate video URL (with fallback)
  const getVideoUrl = (video: HomePageVideoProps): string => {
    // If streamUrl failed, try the original video URL
    if (videoLoadError[video._id]) {
      return video.video;
    }
    return video.streamUrl;
  };

  return (
    <div className="p-6 dark:bg-[#1e1e1e] bg-gray-100 ">
      <h1 className="text-2xl font-bold mb-6">Video Management</h1>
      
      {/* Upload Form */}
      <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Video</h2>
        <form onSubmit={uploadVideo} className="space-y-4">
          {/* Link input field */}
          <div className="mb-4">
            <label htmlFor="video-link" className="block dark:text-white text-sm font-medium text-gray-700 mb-1">
              Video Link (Optional)
            </label>
            <input
              type="url"
              id="video-link"
              placeholder="https://example.com"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              className="w-full p-2 border border-[#333333] bg-[#333333] rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the URL where users will be directed when they click on the video.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
              ref={fileInputRef}
            />
            <label 
              htmlFor="video-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              Select Video
            </label>
            
            {videoFile && (
              <div className="mt-4">
                <p>Selected video:</p>
                <div className="text-left mt-2">
                  <span className="text-sm text-gray-600">
                    {videoFile.name} ({getReadableFileSize(videoFile.size)})
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={uploading || !videoFile}
            className="bg-blue-700 text-white px-4 py-2 rounded disabled:bg-blue-700"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
      
      {/* Display existing videos */}
      <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Videos</h2>
        
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : videos.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No videos found</p>
        ) : (
          <div className="space-y-8">
            {videos.map((video) => (
              <div key={video._id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                  <div className="text-sm text-gray-500">
                    Created: {getFormattedDate(video.createdAt)}
                  </div>
                  {video.link && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Video Link:</span>
                      <a 
                        href={video.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline truncate max-w-xs"
                        title={video.link}
                      >
                        {video.link}
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  {/* Add debug information to help troubleshoot */}
                  <div className="text-xs text-gray-500 mb-1">
                    Video URL: {getVideoUrl(video)}
                  </div>
                  
                  <video 
                    src={getVideoUrl(video)}
                    controls 
                    className="w-full max-h-96 object-contain bg-black"
                    preload="metadata"
                    onError={() => handleVideoError(video._id)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-x-4">
                    <a
                      href={video.downloadUrl}
                      download
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Download Video
                    </a>
                    <button
                      onClick={() => deleteVideo(video._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 truncate max-w-xs" title={video.key}>
                    {video.key.split('/').pop()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePageVideo;