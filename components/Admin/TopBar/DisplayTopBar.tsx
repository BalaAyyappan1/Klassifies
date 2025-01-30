"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";

interface TopBar {
  _id: string;
  adName: string;
  textColor: string;
  bgColor: string;
  fontSize: string;
  link: string;
  createdAt: string;
}

const DisplayTopBar: React.FC = () => {
  const [topBar, setTopBar] = useState<TopBar | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch the most recent top bar
  const fetchRecentTopBar = async () => {
    try {
      const response = await axios.get("/api/admin/top-bar");
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        // Find the most recent top bar based on `createdAt`
        const mostRecent = data.reduce((prev, current) =>
          new Date(prev.createdAt) > new Date(current.createdAt) ? prev : current
        );
        setTopBar(mostRecent);
      }
    } catch (error) {
      console.error("Error fetching top bars:", error);
    }
  };

  useEffect(() => {
    fetchRecentTopBar();
  }, []);

  // Hide the top bar when the close button is clicked
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!topBar || !isVisible) {
    return null; // Don't render anything if there's no top bar or it's hidden
  }

  return (
    <div
      style={{
        backgroundColor: topBar.bgColor,
        padding: "10px",
        textAlign: "center",
        position: "relative",
      }}
      className="flex justify-center items-center"
    >
      {/* Top bar content */}
      <a
        href={topBar.link}
        style={{
          color: topBar.textColor,
          textDecoration: "none",
          fontSize: topBar.fontSize,
          textAlign: "center",
         flex: 1,
        }}
      >
        {topBar.adName}
      </a>

      <button
        onClick={handleClose}
        style={{
          background: "none",
          border: "none",
          color: topBar.textColor,
          position: "absolute",
          right: "10px",
          
        }}
      >
        <IoClose size={20} />
      </button>
    </div>
  );
};

export default DisplayTopBar;