"use client";
import React, { useState, useEffect, useCallback } from "react";
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

// Define the Ad interface - updated to match API response
interface Ad {
  id: string;
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
  location: {
    type: string;
    coordinates: [number, number];
  };
  status: string;
  showAllStates: boolean;
  createdAd: string;
  updatedAd: string;
  userProfile: {
    profilePhoto: string;
    name: string;
  };
  distance?: number; // Distance from user location in km
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

interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

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
  
  // Optimized location state management
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [radius, setRadius] = useState<number>(5);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

  // Memoized location fetching function
  const getUserLocation = useCallback((): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      setIsGettingLocation(true);
      setLocationError(null);

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          };
          resolve(location);
          setIsGettingLocation(false);
        },
        (error) => {
          let errorMessage = "Unknown location error";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          setIsGettingLocation(false);
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }, []);

  // Enhanced location toggle function
  const toggleLocationFilter = async () => {
    if (!isLocationEnabled) {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        setIsLocationEnabled(true);
        setLocationError(null);
        
        // Refetch ads with location if a category is selected
        if (selectedSubcategory) {
          await fetchAds(
            selectedSubcategory.name,
            selectedSubSubcategory?.name || null,
            location
          );
        }
      } catch (error) {
        setLocationError(error instanceof Error ? error.message : "Failed to get location");
        setIsLocationEnabled(false);
        setUserLocation(null);
      }
    } else {
      setIsLocationEnabled(false);
      setUserLocation(null);
      setLocationError(null);
      
      // Refetch ads without location filter
      if (selectedSubcategory) {
        await fetchAds(selectedSubcategory.name, selectedSubSubcategory?.name || null);
      }
    }
  };

  // Enhanced radius change handler with debouncing
  const handleRadiusChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newRadius = parseInt(e.target.value);
      setRadius(newRadius);
      
      // Only refetch if location is enabled and we have both location and selected category
      if (isLocationEnabled && userLocation && selectedSubcategory) {
        await fetchAds(
          selectedSubcategory.name,
          selectedSubSubcategory?.name || null,
          userLocation
        );
      }
    },
    [isLocationEnabled, userLocation, selectedSubcategory, selectedSubSubcategory]
  );

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

  const handleSubcategoryClick = async (subcategory: SubCategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedSubSubcategory(null);
    
    await fetchAds(
      subcategory.name,
      null,
      isLocationEnabled ? userLocation : undefined
    );
  };

  const handleSubSubcategoryClick = async (subSubcategory: SubSubcategory) => {
    setSelectedSubSubcategory(subSubcategory);
    if (selectedSubcategory?.name) {
      await fetchAds(
        selectedSubcategory.name,
        subSubcategory.name,
        isLocationEnabled ? userLocation : undefined
      );
    }
  };

  // Enhanced fetchAds function with better error handling and location support
  const fetchAds = useCallback(async (
    subCategoryName: string,
    subSubCategoryName: string | null = null,
    location?: UserLocation | null
  ) => {
    if (!selectedCategory) return;
    
    setLoading(true);
    setAds([]);
    
    try {
      const url = `/api/ads`;
      const requestBody: any = {
        mainCategoryName: selectedCategory.name,
        subCategory1Name: subCategoryName,
        subCategory2Name: subSubCategoryName || "",
      };
      
      // Add location parameters if provided and enabled
      if (location && isLocationEnabled) {
        requestBody.latitude = location.latitude;
        requestBody.longitude = location.longitude;
        requestBody.radius = radius;
        requestBody.includeDistance = true; // Request distance calculation
      }
      
      console.log("Fetching ads with params:", requestBody);
      
      const response = await axios.post(url, requestBody);

      if (response.data && response.data.ads) {
        console.log("Ads retrieved:", response.data.ads.length, "ads");
        
        // Sort ads by distance if location filtering is enabled
        let sortedAds = response.data.ads;
        if (isLocationEnabled && location) {
          sortedAds = response.data.ads.sort((a: Ad, b: Ad) => {
            return (a.distance || Infinity) - (b.distance || Infinity);
          });
        }
        
        setAds(sortedAds);
      } else {
        console.log("No ads found:", response.data.message);
        setAds([]);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setAds([]);
      
      // Show user-friendly error message
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          console.error("Bad request - check API parameters");
        } else if (error.response?.status === 500) {
          console.error("Server error - try again later");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, isLocationEnabled, radius]);

  // Utility function to format time ago
  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    return `${seconds} seconds ago`;
  };

  // Function to format distance
  const formatDistance = (distance?: number) => {
    if (!distance) return "";
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else {
      return `${distance.toFixed(1)}km away`;
    }
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
              <h3 className="font-medium text-lg text-gray-800 dark:text-white mb-2">
                Location Filter
              </h3>
              
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="locationToggle"
                  checked={isLocationEnabled}
                  onChange={toggleLocationFilter}
                  disabled={isGettingLocation}
                  className="mr-2"
                />
                <label htmlFor="locationToggle" className="text-sm text-gray-700 dark:text-gray-300">
                  {isGettingLocation ? "Getting location..." : "Show nearby ads"}
                </label>
              </div>
              
              {isLocationEnabled && userLocation && (
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
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1km</span>
                    <span>100km</span>
                  </div>
                </div>
              )}
              
              {locationError && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                  <p className="text-red-700 text-xs">{locationError}</p>
                  <button
                    onClick={toggleLocationFilter}
                    className="text-xs text-red-600 underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              )}
              
              {isLocationEnabled && userLocation && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ Location enabled
                </div>
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
              {isLocationEnabled && userLocation && (
                <span className="text-sm font-normal ml-2 text-gray-500">
                  (Within {radius}km)
                </span>
              )}
            </h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">
                  {isLocationEnabled ? "Finding nearby ads..." : "Loading ads..."}
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {ads.length > 0 ? (
                  ads.map((ad) => (
                    <div
                      key={ad.id}
                      className="border pb-4 mb-4 w-full flex justify-between items-start hover:scale-104 rounded-[3px] hover:bg-gray-100 dark:hover:bg-[#333333] cursor-pointer"
                      onClick={() => openModal(ad)}
                    >
                      {/* Title and Description Section */}
                      <div className="flex flex-col items-start w-3/4 pr-4 px-3 py-2">
                        <h3 className="text-xl font-semibold mb-1">
                          {ad.title}
                        </h3>
                        <p className="text-gray-700 dark:text-white">{ad.description}</p>
                        {isLocationEnabled && ad.distance && (
                          <p className="text-sm text-blue-600 mt-1">
                            📍 {formatDistance(ad.distance)}
                          </p>
                        )}
                      </div>

                      {/* User Profile Section */}
                      <div className="flex flex-col items-end space-y-7 py-1 px-3 w-1/4">
                        <p className="text-sm text-gray-500 mb-1">
                          {timeAgo(ad.createdAd)}
                        </p>
                        <div className="flex items-center">
                          <Image
                            src={ad.userProfile?.profilePhoto || placeholder.src}
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
                  <div className="flex flex-col justify-center items-center flex-1">
                    <Image
                      src={SearchImage}
                      alt="Search"
                      className="mx-auto mt-10"
                    />
                    <p className="mt-4 text-gray-600">
                      {selectedSubcategory 
                        ? "No ads found for this category." 
                        : "Select a subcategory to view ads."
                      }
                    </p>
                    {isLocationEnabled && (
                      <p className="text-sm text-gray-500 mt-2">
                        Try increasing the search radius or disable location filter
                      </p>
                    )}
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
          <div className="bg-white dark:bg-[#141414] p-6 w-11/12 max-w-lg relative rounded-[13px] max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 transition-colors z-10"
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
                    {selectedAd.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-[#131313] rounded-full p-2 shadow hover:shadow-lg transition-shadow"
                        >
                          &lt;
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-[#131313] rounded-full p-2 shadow hover:shadow-lg transition-shadow"
                        >
                          &gt;
                        </button>
                      </>
                    )}
                    <div className="flex justify-center mt-2">
                      {selectedAd.images.map((_, index) => (
                        <span
                          key={index}
                          className={`h-2 w-2 rounded-full mx-1 cursor-pointer ${
                            index === currentImageIndex
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <h2 className="text-2xl mt-5 font-bold">{selectedAd.title}</h2>
                <p className="text-gray-700 dark:text-white mt-2">{selectedAd.description}</p>
                
                <div className="mt-4 space-y-1">
                  <p className="text-gray-700 dark:text-white">📍 {selectedAd.address}</p>
                  <p className="text-gray-700 dark:text-white">{selectedAd.city}, {selectedAd.state}</p>
                  {isLocationEnabled && selectedAd.distance && (
                    <p className="text-blue-600 font-medium">
                      Distance: {formatDistance(selectedAd.distance)}
                    </p>
                  )}
                </div>
                
                <div className="pt-4 mt-4 border-t">
                  {isAuthenticated ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">📞</span>
                      <a 
                        href={`tel:${selectedAd.mobile}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {selectedAd.mobile}
                      </a>
                    </div>
                  ) : (
                    <div>
                      {showLoginPrompt ? (
                        <Link
                          href="/auth/signin"
                          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-[12px] hover:bg-blue-600 transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg animate-pulse"
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
                          className="blur-sm cursor-pointer select-none hover:blur-none transition-all"
                          onClick={() => setShowLoginPrompt(true)}
                        >
                          <span className="inline-block bg-gray-200 px-2 py-1 rounded">
                            📞 Click to Reveal Phone Number
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between space-x-3 pt-3 mt-5 border-t">
                  <div className="flex flex-row items-center space-x-2">
                    <Image
                      src={selectedAd.userProfile?.profilePhoto || placeholder.src}
                      alt={selectedAd.userProfile?.name || "Default User"}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    <p className="font-medium text-gray-800 dark:text-white">
                      {selectedAd?.userProfile.name || "Unknown User"}
                    </p>
                  </div>

                  <div className="text-right">
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