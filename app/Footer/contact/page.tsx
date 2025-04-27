"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "@/components/ReusableComponents/Layout";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  ad_id: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "scam_or_fraud",
    message: "",
    ad_id: "",
  });

  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  useEffect(() => {
    // Extract ad_id from URL if present
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const adId = urlParams.get('ad_id');
      if (adId) {
        setFormData(prev => ({ ...prev, ad_id: adId }));
      }
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.message.length < 20) {
      setStatus("The message should contain more than 20 characters.");
      setStatusType("error");
      setTimeout(() => setStatus(null), 5000);
      return;
    }

    try {
      await axios.post(`/api/contact/`, formData);
      setStatus("Thank you for reaching out! We will get back to you soon.");
      setStatusType("success");
      setFormData({
        name: "",
        email: "",
        subject: "scam_or_fraud",
        message: "",
        ad_id: "",
      });
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      setStatus("There was an error submitting the form. Please try again.");
      setStatusType("error");
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <Layout>
      <div className=" bg-gray-50 dark:bg-[#1e1e1e] pt-5 pb-5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white  dark:bg-[#181818] rounded-[8px] shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                Contact Us
              </h2>
              
              {status && (
                <div className={`mb-4 p-3 rounded ${
                  statusType === "success" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {status}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300  dark:bg-[#333333] dark:border-[#333333] rounded-[8px] focus:outline-none focus:none focus:ring-blue-500"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:bg-[#333333] dark:border-[#333333] rounded-[8px] focus:outline-none focus:none focus:ring-blue-500"
                  />

                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:bg-[#333333] dark:border-[#333333] rounded-[8px] focus:outline-none focus:none focus:ring-blue-500"
                  >
                    <option value="scam_or_fraud">Scam or Fraud</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="general">General</option>
                  </select>

                  {formData.subject === "scam_or_fraud" && (
                    <input
                      name="ad_id"
                      placeholder="Ad ID"
                      value={formData.ad_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300  dark:bg-[#333333] dark:border-[#333333] rounded-[8px] focus:outline-none focus:none focus:ring-blue-500"
                    />
                  )}

                  <textarea
                    placeholder="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:bg-[#333333] dark:border-[#333333] rounded-[8px] focus:outline-none focus:none focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-[8px] transition duration-300"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;