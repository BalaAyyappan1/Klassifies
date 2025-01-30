"use client";
import React, { useState, useEffect, useRef } from "react";
import { checkAuthStatus, fetchUserInfo } from "@/components/Api/Api";
import Link from "next/link";
import { DefaultProfile } from "../ReusableComponents/Icons";
import Image from "next/image";

const Profile = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    profile: string;
  } | null>(null);

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

  return (
    <div>
      {userData && (
        <>
          <Link href={"/profile"}>
            <Image
              src={DefaultProfile}
              alt="User Avatar"
              width={35}
              height={35}
              className="rounded-full"
            />
          </Link>
          <div className="flex flex-col items-center space-y-2">
            <Link href={"/profile"}>
              <span className="text-gray-700">{userData.name}</span>
            </Link>
          </div>
        </>
      )}
      
    </div>
  )
}

export default Profile
