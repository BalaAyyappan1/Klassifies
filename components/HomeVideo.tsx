import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

interface Video {
  _id: string;
  createdAt: string;
  link?: string;
  key: string;
  downloadUrl: string;
  streamUrl?: string;
  title?: string;
  description?: string;
}

const HomeVideo = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [showVideo, setShowVideo] = useState<boolean>(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
              setLoading(true);
              const response = await axios.get('/api/admin/video-ads');
              console.log('Fetched videos:', response.data);
              
              if (response.data && response.data.length > 0) {
                // Filter out videos without valid URLs
                const validVideos = response.data.filter((video: { streamUrl: any; downloadUrl: any; link: any; }) => {
                  const url = video.streamUrl || video.downloadUrl || video.link;
                  return !!url; // Only keep videos with a URL
                });
                
                if (validVideos.length > 0) {
                  setVideos([validVideos[0]]);
                } else {
                  setVideos([]);
                }
              } else {
                setVideos([]);
              }
            } catch (error) {
              console.error('Error fetching videos:', error);
              toast.error('Failed to load videos');
            } finally {
              setLoading(false);
            }
          };
        
        fetchVideos();
        
        // Clean-up function
        return () => {
            // Any cleanup if needed
        };
    }, []);

    useEffect(() => {
        if (videos.length > 0 && videoRef.current) {
            const video = videos[0];
            const url = getVideoUrl(video);
            
            console.log('Loading video from URL:', url);
            
            if (!url) {
                console.error('No valid URL found for video');
                setError('No valid video source available');
                return;
            }
            
            // Clear any previous source elements 
            while (videoRef.current.firstChild) {
                videoRef.current.removeChild(videoRef.current.firstChild);
            }
            
            // Create a proper source element (better than setting src attribute)
            const source = document.createElement('source');
            
            // Determine MIME type based on file extension
            const fileExtension = url.split('.').pop()?.toLowerCase();
            
            if (fileExtension === 'mp4') {
                source.type = 'video/mp4';
            } else if (fileExtension === 'webm') {
                source.type = 'video/webm';
            } else if (fileExtension === 'ogg' || fileExtension === 'ogv') {
                source.type = 'video/ogg';
            } else if (fileExtension === 'mov' || fileExtension === 'qt') {
                source.type = 'video/quicktime';
            } else {
                // Default to mp4 if we can't determine the type
                source.type = 'video/mp4';
            }
            
            source.src = url;
            source.onerror = () => {
                console.error(`Error loading video source: ${url}`);
                setError('Failed to load video. The format may not be supported.');
            };
            
            videoRef.current.appendChild(source);
            videoRef.current.muted = true;
            
            // Load and play
            videoRef.current.load();
            videoRef.current.play().catch(err => {
                console.error('Error playing video:', err);
                setError('Failed to play video. Please try again later.');
            });
        }
    }, [videos]);
    
    const closeVideo = () => {
        setShowVideo(false);
    };
    
    const getFormattedDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getVideoUrl = (video: Video) => {
        // Prefer streamUrl for better playback compatibility
        if (video.streamUrl) {
            return video.streamUrl;
        }
        
        // Next try downloadUrl which should be direct file access
        if (video.downloadUrl) {
            return video.downloadUrl;
        }
        
        // Finally fall back to link which might be external
        if (video.link) {
            return video.link;
        }
        
        return '';
    };

    const handleVideoError = (videoId: string) => {
        console.error(`Error loading video with id: ${videoId}`);
        setError(`Failed to load video. Please try again later.`);
    };

    const handleVideoEnded = () => {
        // Play the next video or loop back to the first one
        if (videos.length > 0) {
            setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(err => console.error('Error playing video:', err));
            }
            setIsPlaying(!isPlaying);
        }
    };

    const deleteVideo = async (videoId: string) => {
        try {
            await axios.delete(`/api/admin/video-ads/${videoId}`);
            setVideos(videos.filter(v => v._id !== videoId));
            toast.success('Video deleted successfully');
        } catch (error) {
            console.error('Error deleting video:', error);
            toast.error('Failed to delete video');
        }
    };
    
    if (loading) {
        return <p className="text-center py-8">Loading promotional content...</p>;
    }
    
    if (videos.length === 0) {
        return <p className="text-center py-8 text-gray-500">No promotional videos available</p>;
    }
    
    if (!showVideo) {
        return null;
    }
    
    // Always use the first video (most recent)
    const recentVideo = videos[0];
    
    return (
        <div className="fixed inset-0 w-full h-full z-50 overflow-hidden bg-black bg-opacity-80">
            {/* Main content with blurred background */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 py-8">
                {/* Close button */}
                <button 
                    onClick={closeVideo}
                    className="absolute top-4 right-4 z-20 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-all"
                    aria-label="Close promotion"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {/* Video player with blurred background */}
                <div className="relative w-full max-w-3xl rounded-[10px] overflow-hidden shadow-2xl">
                    {/* Blurred background using the same video */}
                    <div 
                        className="absolute inset-0 z-0 overflow-hidden"
                        style={{ 
                            backgroundImage: `url(${recentVideo.link ? recentVideo.link.replace('.mp4', '.jpg') : ''})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(20px)',
                            transform: 'scale(1.1)',
                            opacity: 0.7
                        }}
                    ></div>
                    
                    {/* Main video with clear display */}
                    <div className="relative z-10">
                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-30">
                                <div className="text-white text-center p-4">
                                    <p>{error}</p>
                                    <button 
                                        onClick={closeVideo}
                                        className="mt-4 px-4 py-2 bg-white text-black rounded-full"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <video
                            ref={videoRef}
                            className="w-full aspect-video object-contain"
                            playsInline
                            autoPlay
                            loop
                            muted={true}
                            controls={false}
                            onClick={() => {
                                const recentVideo = videos[0];
                                if (recentVideo?.link) {
                                    window.location.href = recentVideo.link;
                                }
                            }}
                            style={{ cursor: videos[0]?.link ? 'pointer' : 'default' }}
                        >
                            {/* Source elements will be added dynamically in useEffect */}
                            Your browser does not support the video tag.
                        </video>
                        
                        {/* Hint message for clickable video */}
                        {/* {recentVideo.link && (
                            // <div className="absolute bottom-4 left-4 z-30 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                            //     Click to visit site
                            // </div>
                        )} */}
                    </div>
                </div>
                
                {/* Video Info */}
                <div className="mt-4 text-center text-white">
                    {recentVideo.title && (
                        <h2 className="text-xl font-bold mb-2">{recentVideo.title}</h2>
                    )}
                    {recentVideo.description && (
                        <p className="text-sm text-gray-200 mb-4">{recentVideo.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeVideo;
function setCurrentVideoIndex(arg0: (prevIndex: any) => number) {
    throw new Error('Function not implemented.');
}

