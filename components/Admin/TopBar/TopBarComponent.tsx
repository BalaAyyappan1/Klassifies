"use client"; // Mark this as a Client Component in Next.js

import { useEffect, useState } from "react";

interface TopBar {
  _id: string;
  adName: string;
  textColor: string;
  bgColor: string;
  fontSize: string;
  link: string;
}

export default function TopBarPage() {
  const [topBars, setTopBars] = useState<TopBar[]>([]);
  const [formData, setFormData] = useState({
    adName: "",
    textColor: "#000000",
    bgColor: "#ffffff",
    fontSize: "16px",
    link: "#",
  });

  // Fetch all top bars on component mount
  useEffect(() => {
    fetchTopBars();
  }, []);

  const fetchTopBars = async () => {
    try {
      const response = await fetch("/api/admin/top-bar", { method: "GET" });
      const data = await response.json();
      setTopBars(data);
    } catch (error) {
      console.error("Error fetching top bars:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/top-bar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        fetchTopBars(); // Refresh the list after adding
        setFormData({
          adName: "",
          textColor: "#000000",
          bgColor: "#ffffff",
          fontSize: "16px",
          link: "#",
        });
      }
    } catch (error) {
      console.error("Error adding top bar:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/admin/top-bar", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id }),
      });
      if (response.ok) {
        fetchTopBars(); // Refresh the list after deleting
      }
    } catch (error) {
      console.error("Error deleting top bar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#141414] p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Top Bar Configuration</h1>

      {/* Form to Add New Top Bar */}
      <div className="bg-white  dark:bg-[#141414]  p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Top Bar</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ad Name</label>
            <input
              type="text"
              value={formData.adName}
              onChange={(e) => setFormData({ ...formData, adName: e.target.value })}
              className="mt-1 block w-full p-2 dark:bg-[#333333] border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-white text-gray-700">Text Color</label>
            <input
              type="color"
              value={formData.textColor}
              onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
              className="mt-1 block p-1 border dark:bg-[#333333] border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-white text-gray-700">Background Color</label>
            <input
              type="color"
              value={formData.bgColor}
              onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
              className="mt-1 block  p-1 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-white text-gray-700">Font Size</label>
            <input
              type="text"
              value={formData.fontSize}
              onChange={(e) => setFormData({ ...formData, fontSize: e.target.value })}
              className="mt-1 block w-full p-2 border dark:bg-[#333333] border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-white text-gray-700">Link</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="mt-1 block w-full p-2 border dark:bg-[#333333] border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className=" bg-blue-700 text-white  py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Add Top Bar
          </button>
        </form>
      </div>

      {/* Display All Top Bars */}
      <div className="bg-white dark:bg-[#141414] p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Top Bars</h2>
        {topBars.length === 0 ? (
          <p className="text-gray-500">No top bars found.</p>
        ) : (
          <div className="space-y-4">
            {topBars.map((topBar) => (
              <div
                key={topBar._id}
                className="p-4 border border-gray-200 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{topBar.adName}</p>
                  <p style={{ color: topBar.textColor, backgroundColor: topBar.bgColor, fontSize: topBar.fontSize }}>
                    Preview: {topBar.adName}
                  </p>
                  <p className="text-sm text-gray-500">Link: {topBar.link}</p>
                </div>
                <button
                  onClick={() => handleDelete(topBar._id)}
                  className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}