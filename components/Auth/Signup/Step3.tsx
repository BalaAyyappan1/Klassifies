"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface Step3Props {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
}

const Step3: React.FC<Step3Props> = ({ name, phoneNumber, email, password }) => {
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const router = useRouter();
  
  const handleChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < code.length - 1) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
    }
  };


  const handleSubmit = async () => {
    if (code.every((digit) => digit)) {
      const otp = code.join("");
      const userDetails = { email, emailOtp: otp, password, phoneNumber, name };
      
      try {
        const response = await axios.post("/api/auth/signup", userDetails);
        if (response.data.message === "User created successfully") {
          toast.success("User registered successfully!");
          router.push("/");
        } else {
          toast.error(response.data.message || "Failed to verify OTP.");
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(`Error: ${error.response?.data.message || "Failed to verify OTP. Please try again."}`);
        } else {
          toast.error("Error verifying OTP. Please try again.");
        }
      }
    } 
  };

  return (
    <div className="p-5 min-h-[430px] flex flex-col space-y-6">
      <div className="text-center space-y-2 mt-7">
        <h2 className="text-2xl font-bold">Verify Your Account</h2>
        <span className="text-sm text-center">
          Enter the passcode sent to your email to verify your account and ensure its security.
        </span>
      </div>

      <div className="flex justify-center space-x-2 mt-4">
        {code.map((digit, index) => (
          <input
            key={index}
            id={`code-input-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="-"
            maxLength={1}
            className="w-[60px] h-[60px] text-center text-xl border rounded focus:outline-none focus:ring focus:ring-blue-200"
          />
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="bg-blue-800 text-white rounded px-4 py-1 hover:bg-blue-700"
          onClick={handleSubmit} 
        >
          Verify OTP
        </button>
      </div>
    </div>

  );
};

export default Step3;
