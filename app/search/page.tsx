"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/ReusableComponents/Layout";
import axios from "axios";
import SearchImage from "@/public/Search.png";
import Image from "next/image";
import placeholder from "@/public/placeholder.jpg";
import { checkAuthStatus, fetchUserInfo } from "@/components/Api/Api";
import Link from "next/link";

// Define the Ad interface (same as in your category page)
interface Ad {
  _id: string;
  userId: string;
  title: string;
  description: string;
  mainCategory: string;
  subCategory: string;
  subCategory2: string;
  images: string[];
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  location: object;
  status: string;
  showAllStates: boolean;
  createdAd: string;
  updatedAd: string;
  __v: number;
  userProfile: {
    profilePhoto: string;
    name: string;
  };
}

const Page = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const isAuth = await checkAuthStatus();
        setIsAuthenticated(isAuth);
        if (isAuth) {
          await fetchUserInfo();
        }
      } catch (error) {
        console.error("Authentication or user fetch error:", error);
      }
    };

    authenticate();
  }, []);
  
  // Reset the current image index when the selected ad changes
  useEffect(() => {
    if (selectedAd) {
      setCurrentImageIndex(0);
    }
  }, [selectedAd]);

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery);
    } else {
      setAds([]);
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchSearchResults = async (query: string) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/search-ads", {
        searchQuery: query
      });

      if (response.data && response.data.ads) {
        console.log("Search results:", response.data.ads);
        setAds(response.data.ads);
      } else {
        console.error("No ads found:", response.data.message);
        setAds([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  // Utility function to format time ago
  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    let interval = Math.floor(seconds / 31536000); // Years
    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000); // Months
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400); // Days
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600); // Hours
    if (interval > 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60); // Minutes
    if (interval > 1) return `${interval} minutes ago`;
    return `${seconds} seconds ago`;
  };

  // Function to open the modal with selected ad details
  const openModal = (ad: Ad) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  // Function to go to the next image
  const nextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % (selectedAd?.images.length || 1)
    );
  };

  // Function to go to the previous image
  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + (selectedAd?.images.length || 1)) %
        (selectedAd?.images.length || 1)
    );
  };

  return (
    <div>
      <Layout>
        <div className="flex flex-col mt-10 mb-10 p-4 items-center">
          <div className="w-full max-w-6xl p-6 bg-white dark:bg-[#141414] rounded-[10px] shadow-md overflow-hidden overflow-y-auto min-h-[500px] flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Search Results"}
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Loading results...</p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {ads.length > 0 ? (
                  ads.map((ad) => (
                    <div
                      key={ad._id}
                      className="border pb-4 mb-4 w-full flex justify-between items-start hover:scale-104 rounded-[3px] hover:bg-gray-100 dark:hover:bg-[#333333] cursor-pointer"
                      onClick={() => openModal(ad)}
                    >
                      {/* Title and Description Section */}
                      <div className="flex flex-col items-start w-3/4 pr-4 px-3 py-2">
                        <h3 className="text-xl font-semibold mb-1">
                          {ad.title}
                        </h3>
                        <p className="text-gray-700 dark:text-white mb-1">
                          {ad.description}
                        </p>
                        <div className="text-sm text-gray-500">
                          <span className="mr-2">{ad.city}</span>
                          {ad.state && <span>{ad.state}</span>}
                        </div>
                      </div>

                      {/* User Profile Section */}
                      <div className="flex flex-col items-end space-y-7 py-1 px-3 w-1/4">
                        <p className="text-sm text-gray-500 mb-1">
                          {timeAgo(ad.createdAd)}
                        </p>
                        <div className="flex items-center">
                          <Image
                            src={
                              ad.userProfile?.profilePhoto || placeholder.src
                            }
                            alt={ad.userProfile?.name || "Default User"}
                            width={100}
                            height={100}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="font-medium">
                            {ad.userProfile?.name || "Unknown User"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col justify-center items-center">
                    <Image
                      src={SearchImage}
                      alt="Search"
                      className="mx-auto mt-10"
                    />
                    <p>No ads found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* Custom Modal for displaying full ad details */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-[#141414] p-6 w-11/12 max-w-lg relative rounded-[13px]">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {selectedAd && (
              <>
                {selectedAd.images.length > 0 && (
                  <div className="relative mt-4">
                    <Image
                      src={selectedAd.images[currentImageIndex]}
                      width={100}
                      height={100}
                      alt={selectedAd.title}
                      className="w-full h-64 object-cover rounded-[10px]"
                    />
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-[#131313] rounded-full p-2 shadow"
                    >
                      &lt;
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-[#131313] rounded-full p-2 shadow"
                    >
                      &gt;
                    </button>
                    <div className="flex justify-center mt-2">
                      {selectedAd.images.map((_, index) => (
                        <span
                          key={index}
                          className={`h-2 w-2 rounded-full mx-1 ${
                            index === currentImageIndex
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <h2 className="text-2xl mt-5 font-bold">{selectedAd.title}</h2>
                <p className="text-gray-700 dark:text-white">{selectedAd.description}</p>
                <p className="text-gray-700 dark:text-white">{selectedAd.address}</p>
                <p className="text-gray-700 dark:text-white">{selectedAd.city}</p>
                <p className="text-gray-700 dark:text-white">{selectedAd.state}</p>
                <div className="pt-2">
                  {isAuthenticated ? (
                    <p className="text-gray-700">{selectedAd.mobile}</p>
                  ) : (
                    <div>
                      {showLoginPrompt ? (
                        <Link
                          href="/auth/signin"
                          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-[12px] hover:bg-blue-600 transition-all 
                          transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg animate-pulse"
                        >
                          <span className="flex items-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 animate-bounce"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>Login to View Number</span>
                          </span>
                        </Link>
                      ) : (
                        <div
                          className="blur-sm cursor-pointer select-none"
                          onClick={() => setShowLoginPrompt(true)}
                        >
                          <span className="inline-block bg-gray-200 px-2 py-1 rounded">
                            Click to Reveal
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between space-x-3 pt-3 mt-5">
                  <div className="flex flex-row items-center mr-2">
                    <Image
                      src={selectedAd.userProfile?.profilePhoto || placeholder.src}
                      alt={selectedAd.userProfile?.name || "Default User"}
                      width={100}
                      height={100}
                      className="w-10 h-10 rounded-full"
                    />
                    <p className="font-medium text-gray-800 ml-2">
                      {selectedAd.userProfile?.name || "Unknown User"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      {timeAgo(selectedAd.createdAd)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;