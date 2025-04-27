"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners";
import LabelInput from "@/components/ReusableComponents/LabelInput";

import { GoArrowRight } from "react-icons/go";
import { forgotPassword } from "@/components/Api/Api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const data = await forgotPassword(email);
      toast.success(data.message || "Password reset email sent successfully. Please check Your email.");

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Something went wrong.");
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>
      
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <form onSubmit={handleSubmit}>
        <LabelInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          labelText=""
          htmlFor="email"
        />
        <button
          type="submit"
          className="relative w-full h-[44px] bg-blue-700 text-white py-2 rounded flex items-center justify-center dark:bg-blue-700 hover:bg-blue-500"
          disabled={loading} // Disable button while loading
        >
          {loading ? (
            <ClipLoader size={24} color="#ffffff" />
          ) : (
            <>
              <span className="flex-grow text-center">Submit</span>
              {/* <div className="absolute right-2 p-2 rounded-full w-[35px] h-[35px] bg-white text-white dark:text-black flex items-center justify-center">
                <GoArrowRight className="w-6 h-6 text-black" />
              </div> */}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
