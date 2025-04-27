"use client";

import React, { useState } from "react";
import LabelInput from "@/components/ReusableComponents/LabelInput";

interface Step2Props {
  name: string;
  phone: string;
  email: string;
  onContinue: (email: string, password: string) => void;
}

const Step2: React.FC<Step2Props> = ({  onContinue }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setEmailError] = useState("");
  const [errorPass, setPassError] = useState("");

  const handleContinue = () => {
    let isValid = true;

    if (!email.trim() || !email.includes("@")) {
      setEmailError("Valid email is required.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (password.trim().length < 6) {
      setPassError("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPassError("");
    }

    if (isValid) {
      onContinue(email, password);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-5 ">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold leading-[24.72px]">Email & Password</h2>
        <p className="text-[rgba(0,0,0,0.66)] dark:text-white text-sm leading-[22px]">
          Please provide your email and password to continue.
        </p>
      </div>

      <LabelInput
        labelText=""
        htmlFor="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        errorMessage={errorEmail}
      />

      <LabelInput
        labelText=""
        htmlFor="password"
        type="password"
        placeholder="Create your Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        errorMessage={errorPass}
      />

      <div className="flex justify-end mt-4">
        <button
          className="bg-blue-800 text-white rounded px-4 py-1 hover:bg-blue-700 transition-all"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
    //new
  );
};

export default Step2;
