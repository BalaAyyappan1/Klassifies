"use client";
import React, { useState, useEffect } from "react";
import { checkAuthStatus, fetchUserInfo } from "@/components/Api/Api";
import Link from "next/link";
import { DefaultProfile } from "../ReusableComponents/Icons";
import Image from "next/image";
import { FaSignOutAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
const Profile = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    profile: string;
  } | null>(null);
  const [adsData, setAdsData] = useState<any[]>([]);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const isAuth = await checkAuthStatus();
        setIsAuthenticated(isAuth);
        if (isAuth) {
          const userInfo = await fetchUserInfo();
          console.log(userInfo);
          setUserData(userInfo);
        }
      } catch (error) {
        console.error("Authentication or user fetch error:", error);
      }
    };

    authenticate();
  }, []);

  const fetchUserAds = async () => {
    try {
      const response = await fetch("/api/user-ads", {});
      if (!response.ok) {
        throw new Error("Failed to fetch user ads");
      }
      const data = await response.json();
      console.log(data);
      setAdsData(data.ads);
    } catch (error) {
      console.error("Error fetching user ads:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserAds();
    }
  }, [isAuthenticated]);

  const handleAdClick = (ad: any) => {
    setSelectedAd(ad);
  };

  const handleCloseDetails = () => {
    setSelectedAd(null);
  };

  return (
    <div className="px-24 mt-10 mb-[400px] ">
      <div className="border  shadow-md rounded-xl mb-50">
        {userData && (
          <>
            <div className="flex flex-row justify-between items-center px-10 mt-5 mb-5">
              <div className="flex flex-row space-x-3 justify-center items-center">
                <Link href={"/profile"}>
                  <Image
                    src={DefaultProfile}
                    alt="User Avatar"
                    width={35}
                    height={35}
                    className="rounded-full"
                  />
                </Link>
                <div className="flex flex-col items-center space-y-5 ">
                  <Link href={"/profile"}>
                    <span className="text-black dark:text-white font-medium">
                      {userData.name}
                    </span>
                  </Link>
                </div>
              </div>

              <div
                className="flex items-center cursor-pointer"
                onClick={async () => {
                  try {
                    // Call the sign-out API
                    const response = await fetch("/api/auth/signout", {
                      method: "POST",
                    });

                    if (response.ok) {
                      // Clear user data and authentication status
                      setIsAuthenticated(false);
                      setUserData(null);
                      // Redirect to the login page
                      await router.push("/"); // Adjust the path as necessary
                    } else {
                      console.error("Failed to sign out");
                    }
                  } catch (error) {
                    console.error("Error during sign out:", error);
                  }
                }}
              >
                <FaSignOutAlt className="text-red-700 mr-2" />
              </div>
            </div>
          </>
        )}
        <div className="border-t" />
        <div className="mt-7 mb-10 px-10">
          {adsData.map((ad) => (
            <div
              key={ad._id}
              className="flex justify-between border-b py-4 px-3 bg-gray-100 dark:bg-[#333333] rounded-[3px] shadow-md mb-4 cursor-pointer"
              onClick={() => handleAdClick(ad)}
            >
              <div className="flex flex-col space-y-2">
                <h3 className="font-bold text-lg">{ad.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {ad.description}
                </p>
              </div>
              <div className="hidden sm:block md:block">
                <div className="flex flex-col items-end space-y-3 ">
                  <p className="text-sm text-gray-500">
                    {new Date(ad.createdAd).toLocaleDateString()}
                  </p>
                  <p
                    className={`text-${
                      ad.status === "pending" ? "yellow-500" : "green-500"
                    }`}
                  >
                    {ad.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedAd && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-[#333333] p-4 rounded shadow-lg">
              <h2 className="font-bold text-xl">{selectedAd.title}</h2>
              <p>{selectedAd.description}</p>
              <p>
                <strong>Address:</strong> {selectedAd.address}
              </p>
              <p>
                <strong>City:</strong> {selectedAd.city}
              </p>
              <p>
                <strong>State:</strong> {selectedAd.state}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedAd.mobile}
              </p>
              <p>
                <strong>Status:</strong> {selectedAd.status}
                <strong>Status:</strong> {selectedAd.mainCategory}
                <strong>Status:</strong> {selectedAd.subCategory}
                <strong>Status:</strong> {selectedAd.subCategory2}



              </p>
              <p>
                <strong>Created On:</strong>{" "}
                {new Date(selectedAd.createdAd).toLocaleDateString()}
              </p>
              <button
                onClick={handleCloseDetails}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
