"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleClick = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      className="  rounded-full transition-colors duration-300 focus:outline-none "
      id="theme-toggle"
      aria-label="auto"
      aria-live="polite"
      onClick={handleClick}
    >
      {theme === "dark" ? (
        <div className="flex items-center justify-center gap-4">
          <FiSun className=" text-purple-200" /> 
        </div>
      ) : (
        <div className="flex items-center  justify-center gap-4">
          <FiMoon className=" text-purple-heart-600" /> 
        </div>
      )}
    </button>
  );
}