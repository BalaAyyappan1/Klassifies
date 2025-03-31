import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CompanyLogo, DefaultProfile } from "../Icons";
import LabelInput from "../LabelInput";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { categoryData } from "@/Data/Categories";
import { slugify } from "@/utils/slugify";
import { checkAuthStatus, fetchUserInfo } from "@/components/Api/Api";
import DisplayTopBar from "@/components/Admin/TopBar/DisplayTopBar";
import { useRouter } from "next/navigation";

const TopBar: React.FC = () => {
  const router = useRouter();
  const [searchBar, setSearchBar] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<{
    name: string;
    profile: string;
  } | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const isAuth = await checkAuthStatus();
        setIsAuthenticated(isAuth);
        if (isAuth) {
          const userInfo = await fetchUserInfo();
          console.log(userInfo);
          setUserData(userInfo);
        }
      } catch (error) {
        console.error("Authentication or user fetch error:", error);
      }
    };

    authenticate();
  }, []);

  const handleScroll = (direction: string) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchBar.trim() !== "") {
      // Navigate to search results page with the search query
      router.push(`/search?q=${encodeURIComponent(searchBar)}`);
    }
  };


  return (
    <div>
      <DisplayTopBar />

      <div className="flex items-center border-b dark:border-[#333333] py-4 px-5 justify-between">
        {/* Logo Section */}
        <div>
          <Link href={"/"}>
            <Image src={CompanyLogo} alt="Logo" width={35} className="ml-5" />
          </Link>
        </div>

        {/* Search Bar Section */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md flex-grow hidden sm:block md:block">
          <LabelInput
            type="text"
            placeholder="Search by title, city, or state..."
            value={searchBar}
            onChange={(e) => setSearchBar(e.target.value)}
            labelText={""}
            htmlFor={""}
            className="w-full"
          />
          <button 
            type="submit" 
            className="absolute right-0 top-[26px] transform -translate-y-1/2 bg-blue-800 p-[0.64rem] rounded-tr rounded-br"
          >
            <FaSearch className="text-white" />
          </button>
        </form>

        <div>
          {!isAuthenticated ? (
            <div className="flex flex-col text-center space-y-2">
              <span>
                Hi Guest |{" "}
                <Link href="/auth/signin" className="text-blue-800">
                  Login
                </Link>
              </span>
              <Link href="/create-ad">
                <span className="font-medium text-blue-800">Create Ad</span>
              </Link>
            </div>
          ) : (
            <div>
              {userData && (
                <>
                  <div className="flex flex-row items-center space-x-2">
                    <Link href={"/profile"}>
                      <Image
                        src={DefaultProfile}
                        alt="User Avatar"
                        width={35}
                        height={35}
                        className="rounded-full"
                      />
                    </Link>
                    <div className="flex flex-col items-center space-y-2">
                      <Link href={"/profile"}>
                        <span className="text-black dark:text-white">{userData.name}</span>
                      </Link>
                      <Link href="/create-ad">
                        <span className="font-medium text-blue-800">
                          Create Ad
                        </span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Categories Scroll Section */}

      <div className="flex items-center border-b dark:border-[#333333]">
        <FaChevronLeft
          className="cursor-pointer w-7 h-6 text-gray-600"
          onClick={() => handleScroll("left")}
        />
        <div
          ref={scrollContainerRef}
          className="flex flex-row overflow-x-auto overflow-hidden no-scrollbar space-x-5 p-2"
        >
          {categoryData.mainCategories.map((category) => (
            <Link
              key={category.id}
              href={`/ad/${slugify(category.name)}`}
              passHref
            >
              <div className="flex-shrink-0 rounded-lg p-1 transform transition-all duration-300 hover:scale-105  cursor-pointer whitespace-nowrap overflow-hidden overflow-ellipsis">
                <div className="font-medium text-sm text-center">
                  {category.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <FaChevronRight
          className="cursor-pointer w-7 h-6 text-gray-600"
          onClick={() => handleScroll("right")}
        />
      </div>
    </div>
  );
};

export default TopBar;
