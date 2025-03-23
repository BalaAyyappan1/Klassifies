"use client";

import React, { useState } from "react";
import LabelInput from "@/components/ReusableComponents/LabelInput";
import Image from "next/image";
import Link from "next/link";
import { GoogleIcon } from "@/components/ReusableComponents/Icons";
import { loginWithGoogle } from "@/components/Api/Api";


interface Step1Props {
  name: string;
  phone: string;
  onContinue: (name: string, phone: string) => void;
}

const Step1: React.FC<Step1Props> = ({ onContinue }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleContinue = () => {
    if (!username.trim()) {
      setError("Name is required.");
    } else if (username.trim().length < 4) {
      setError("Name must be at least 4 characters long.");
    } else {
      setError("");
      console.log("Proceeding with username:", username);
      onContinue(username, phoneNumber); 
    }
  };

  return (
    <div className="flex flex-grow flex-col space-y-6 p-5 min-h-[430px]">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold leading-[24.72px]">
          Welcome to Klassifies
        </h2>
        <p className="text-[rgba(0,0,0,0.66)] dark:text-white text-sm leading-[22px]">
          Sign into your account. If you don&apos;t have one, <br />
          you&apos;ll be prompted to create one.
        </p>
      </div>
      <div>
        <LabelInput
          labelText=""
          htmlFor="username"
          type="username"
          value={username}
          placeholder="Enter your name"
          onChange={(e) => setUsername(e.target.value)}
          errorMessage={error}
        />

        <LabelInput
          labelText=''
          placeholder='Enter your phone number'
          htmlFor='phonenumber'
          type='phonenumber'
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-800 text-white rounded px-4 py-1 hover:bg-blue-700"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
        <div className="space-y-5">
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-[#8D8B8B]"></div>
            <span className="mx-4 text-[#9B9797]">OR</span>
            <div className="flex-grow border-t border-[#8D8B8B]"></div>
          </div>

          <Link href="/auth/signin">
            <div className="text-center">
              <span>Already have an account? </span>
              <span className="font-medium">Login here</span>
            </div>
          </Link>

          <div className="px-5">
            <button
              onClick={loginWithGoogle}
              className="relative w-full h-[44px] bg-blue-800 text-white py-2 rounded flex items-center justify-center dark:bg-blue-800 hover:bg-blue-700 transition-all duration-300"
            >
              <span className="flex-grow text-center group-hover:text-gray-300">
                Continue With Google
              </span>
              <div className="absolute left-2 p-2 rounded-full w-[35px] h-[35px] text-white dark:text-black flex items-center justify-center bg-transparent group-hover:bg-gray-800 transition-all duration-300">
                <Image src={GoogleIcon} alt={"logo"} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1;
