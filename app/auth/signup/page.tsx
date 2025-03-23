"use client";

import Step1 from "@/components/Auth/Signup/Step1";
import Step2 from "@/components/Auth/Signup/Step2";
import Step3 from "@/components/Auth/Signup/Step3";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowLeft as BackIcon } from "react-icons/fa6";
import Layout from "@/components/ReusableComponents/Layout";
const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleStep1Continue = (name: string, phone: string) => {
    setUserData((prev) => ({ ...prev, name, phone }));
    setStep(2);
  };

  const handleStep2Continue = (email: string, password: string) => {
    setUserData((prev) => ({ ...prev, email, password }));
    handleSendOtp(email, password); // Trigger OTP send and move to the next step
  };

  const handleSendOtp = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        toast.error("Email and password are required.");
        return;
      }

      console.log("Sending OTP with data:", { ...userData, email, password });

      const response = await axios.post("/api/auth/signup", {
        name: userData.name,
        phoneNumber: userData.phone,
        email,
        password,
      });

      if (response.data.otpSent) {
        toast.success("OTP sent successfully!");
        setStep(3); // Proceed to Step 3
      } else {
        toast.error(response.data.message || "Failed to send OTP.");
      }
    } catch (error: any) {
      toast.error(
        `Error: ${error.response?.data?.message || "Failed to send OTP. Please try again."}`
      );
    }
  };

  return (
    <Layout>
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-[#181818]">
      <div className="w-[444px] max-w-md bg-white shadow-md rounded-[20px] p-6 dark:bg-[#1e1e1e] dark:text-white">
        {step !== 1 && (
          <div className="flex justify-start mb-4">
            <button
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              className="text-[rgba(0,0,0,0.66)] hover:text-black dark:text-white"
            >
              <BackIcon />
            </button>
          </div>
        )}

        {step === 1 && (
          <Step1
            name={userData.name}
            phone={userData.phone}
            onContinue={handleStep1Continue}
          />
        )}
        {step === 2 && (
          <Step2
            name={userData.name}
            phone={userData.phone}
            email={userData.email}
            onContinue={handleStep2Continue}
          />
        )}
        {step === 3 && (
          <Step3
            name={userData.name}
            phoneNumber={userData.phone}
            email={userData.email}
            password={userData.password}
          />
        )}

      </div>
    </div>
    </Layout>

  );
};

export default SignupPage;
