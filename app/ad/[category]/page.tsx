"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/ReusableComponents/Layout";
import { categoryData } from "@/Data/Categories";
import { slugify } from "@/utils/slugify";
import axios from "axios";
import SearchImage from "@/public/Search.png";
import Image from "next/image";
import placeholder from "@/public/placeholder.jpg";
import { checkAuthStatus, fetchUserInfo } from "@/components/Api/Api";
import Link from "next/link";

// Define the Ad interface
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
  pincode: string;
  state: string;
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

type SubSubcategory = {
  name: string;
  id?: number;
};

type SubCategory = {
  name: string;
  id: number;
  subcategories?: SubSubcategory[];
};

const Page = () => {
  const params = useParams();
  const { category } = params;
  
  // Move this up before any conditional logic
  const selectedCategory = categoryData.mainCategories.find(
    (cat) => slugify(cat.name) === category
  );

  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<SubSubcategory | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // New state for location filtering
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [radius, setRadius] = useState<number>(5); // Default radius: 5km
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const isAuth = await checkAuthStatus();
        setIsAuthenticated(isAuth);
        if (isAuth) {
          const userInfo = await fetchUserInfo();
          console.log(userInfo);
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

  // Get user location
  const getUserLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsLocationEnabled(true);
          
          // Refetch ads with location filter if a category is already selected
          if (selectedSubcategory) {
            fetchAds(
              selectedSubcategory.name,
              selectedSubSubcategory?.name || null,
              position.coords.latitude,
              position.coords.longitude,
              radius
            );
          }
        },
        (error) => {
          setLocationError("Error getting location: " + error.message);
          setIsLocationEnabled(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLocationEnabled(false);
    }
  };

  // Toggle location filtering
  const toggleLocationFilter = () => {
    if (!isLocationEnabled) {
      getUserLocation();
    } else {
      setIsLocationEnabled(false);
      // Refetch ads without location filter if a category is already selected
      if (selectedSubcategory) {
        fetchAds(selectedSubcategory.name, selectedSubSubcategory?.name || null);
      }
    }
  };

  // Handle radius change
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    
    // Refetch ads with new radius if location is enabled and a category is selected
    if (isLocationEnabled && userLocation && selectedSubcategory) {
      fetchAds(
        selectedSubcategory.name,
        selectedSubSubcategory?.name || null,
        userLocation.latitude,
        userLocation.longitude,
        newRadius
      );
    }
  };

  // Handle case when category is not found
  if (!selectedCategory) {
    return (
      <Layout>
        <div className="text-center mt-10">
          <h2 className="text-xl font-bold">Category Not Found</h2>
          <p className="text-gray-600">
            The category you are looking for does not exist. Please check the
            URL or return to the homepage.
          </p>
        </div>
      </Layout>
    );
  }

  const handleSubcategoryClick = (subcategory: SubCategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedSubSubcategory(null);
    
    // If location is enabled, include location params
    if (isLocationEnabled && userLocation) {
      fetchAds(
        subcategory.name,
        null,
        userLocation.latitude,
        userLocation.longitude,
        radius
      );
    } else {
      fetchAds(subcategory.name);
    }
  };

  const handleSubSubcategoryClick = (subSubcategory: SubSubcategory) => {
    setSelectedSubSubcategory(subSubcategory);
    if (selectedSubcategory?.name) {
      // If location is enabled, include location params
      if (isLocationEnabled && userLocation) {
        fetchAds(
          selectedSubcategory.name,
          subSubcategory.name,
          userLocation.latitude,
          userLocation.longitude,
          radius
        );
      } else {
        fetchAds(selectedSubcategory.name, subSubcategory.name);
      }
    }
  };

  const fetchAds = async (
    subCategoryName: string,
    subSubCategoryName: string | null = null,
    latitude?: number,
    longitude?: number,
    radius?: number
  ) => {
    setLoading(true);
    try {
      const url = `/api/ads`;
      const requestBody: any = {
        mainCategoryName: selectedCategory.name,
        subCategory1Name: subCategoryName,
        subCategory2Name: subSubCategoryName || "",
      };
      
      // Add location parameters if provided
      if (latitude !== undefined && longitude !== undefined && radius !== undefined) {
        requestBody.latitude = latitude;
        requestBody.longitude = longitude;
        requestBody.radius = radius;
      }
      
      const response = await axios.post(url, requestBody);

      if (response.data && response.data.ads) {
        console.log("Ads retrieved:", response.data.ads);
        setAds(response.data.ads);
      } else {
        console.error("No ads found:", response.data.message);
        setAds([]);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
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
        <div className="flex flex-row mt-10 mb-10 p-4 justify-center">
          {/* Left Column (Sidebar) */}
          <div className="h-[700px] w-[15%] p-6 bg-gray-100 dark:bg-[#1A1A1D] rounded-tl-[10px] rounded-bl-[10px] shadow-md overflow-hidden overflow-y-auto">
            {/* Location filter controls */}
            <div className="mb-6 border-b pb-4">
              <h3 className="font-medium text-lg text-gray-800 dark:text-white mb-2">Location Filter</h3>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="locationToggle"
                  checked={isLocationEnabled}
                  onChange={toggleLocationFilter}
                  className="mr-2"
                />
                <label htmlFor="locationToggle" className="text-sm text-gray-700 dark:text-gray-300">
                  Show nearby ads
                </label>
              </div>
              
              {isLocationEnabled && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Radius: {radius} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={radius}
                    onChange={handleRadiusChange}
                    className="w-full"
                  />
                  
                </div>
              )}
              
              {locationError && (
                <p className="text-red-500 text-xs mt-1">{locationError}</p>
              )}
            </div>
            
            <div className="space-y-4">
              {selectedCategory.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="border-b pb-2 mb-2">
                  <p
                    className="font-medium text-lg text-gray-800 dark:text-white cursor-pointer dark:hover:text-blue-600 hover:text-blue-600"
                    onClick={() => handleSubcategoryClick(subcategory)}
                  >
                    {subcategory.name}
                  </p>
                  {/* Display sub-subcategories if any */}
                  {subcategory.subcategories2 &&
                    subcategory.subcategories2.length > 0 && (
                      <div className="ml-4">
                        {subcategory.subcategories2.map((subSubcategory) => (
                          <p
                            key={subSubcategory.id}
                            className="text-sm text-gray-600 cursor-pointer hover:text-blue-500"
                            onClick={() =>
                              handleSubSubcategoryClick(subSubcategory)
                            }
                          >
                            - {subSubcategory.name}
                          </p>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Main Content) */}
          <div className="w-full max-w-6xl p-6 bg-white dark:bg-[#141414] rounded-tr-[10px] rounded-br-[10px] shadow-md overflow-hidden overflow-y-auto h-[700px] flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">
              {selectedCategory.name}
              {isLocationEnabled && (
                <span className="text-sm font-normal ml-2 text-gray-500">
                  (Showing ads within {radius}km)
                </span>
              )}
            </h2>
            {loading ? (
              <p>Loading ads...</p>
            ) : (
              <div className="w-full flex flex-col items-center">
                {ads.length > 0 ? (
                  ads.map((ad) => (
                    <div
                      key={ad._id}
                      className="border pb-4 mb-4 w-full flex justify-between items-start hover:scale-104  rounded-[3px] hover:bg-gray-100 dark:hover:bg-[#333333]  cursor-pointer"
                      onClick={() => openModal(ad)}
                    >
                      {/* Title and Description Section */}
                      <div className="flex flex-col items-start w-3/4 pr-4 px-3 py-2 ">
                        <h3 className="text-xl font-semibold mb-1">
                          {ad.title}
                        </h3>
                        <p className="text-gray-700 dark:text-white">{ad.description}</p>
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
                    <p>No ads found for this category.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* Custom Modal for displaying full ad details */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center  bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-[#141414]  p-6 w-11/12 max-w-lg relative rounded-[13px]">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-1 right-1 text-gray-500 hover:text-gray-700  transition-colors"
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
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white  dark:bg-[#131313] rounded-full p-2 shadow"
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
                      src={placeholder.src}
                      alt={"Default User"}
                      width={100}
                      height={100}
                      className="w-10 h-10 rounded-full"
                    />
                    <p className="font-medium text-gray-800">
                      {selectedAd?.userProfile.name || "Unknown User"}
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