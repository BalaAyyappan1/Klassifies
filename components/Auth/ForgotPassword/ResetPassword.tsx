"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LabelInput from "@/components/ReusableComponents/LabelInput";
import ClipLoader from "react-spinners/ClipLoader";
import { GoArrowRight } from "react-icons/go";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the token from the URL
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("No reset token found in the URL.");
    }
  }, [token]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !token) {
      toast.error("Both fields are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword, token }),
      });

      const data = await res.json();

      if (res.status === 200) {
        toast.success("Password reset successfully!");
        setTimeout(() => router.push("/auth/signin"), 2000);
      } else {
        toast.error(data.message || "An error occurred.");
      }
    } catch {
      toast.error("Internal server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 rounded-lg shadow-lg">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-semibold mb-4">Forgot Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <LabelInput
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password here"
            labelText={""}
            htmlFor={""}
          />
        </div>
        <button
          type="submit"
          className="relative w-full h-[44px] bg-blue-700 text-white py-2 rounded flex items-center justify-center dark:bg-blue-700 hover:bg-blue-500"
          disabled={loading} // Disable button while loading
        >
          {loading ? (
            <ClipLoader size={24} color="#ffffff" />
          ) : (
            <>
              <span className="flex-grow text-center">Reset Password</span>
              {/* <div className="absolute right-2 p-2 rounded-full w-[35px] h-[35px] bg-white text-white dark:text-black flex items-center justify-center">
                <GoArrowRight className="w-6 h-6 text-black" />
              </div> */}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
