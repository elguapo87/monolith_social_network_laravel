"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import { assets } from "../../public/assets";
import MenuItems from "./MenuItems";
import Link from "next/link";
import { CirclePlus, LogOut } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "@/context/UserContext";
import axios from "@/lib/axios";

type AuthLayoutProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar = ({ sidebarOpen, setSidebarOpen } : AuthLayoutProps) => {

  const context = useContext(UserContext);
  if (!context) throw new Error("Sidebar must be within UserContextProvider");
  const { setUser, user } = context;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      setUser(null);
      router.push("/");

    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Logout failed:", errMessage);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as HTMLElement).contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center
        max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"}
        transition-all duration-300 ease-in-out`}
    >
      <div className="w-full">
        <Image 
          onClick={() => router.push("/auth")} 
          src={assets.monolith_logo}
          alt="Logo"
          width={120} 
          height={40}
          className="w-30 ml-7 my-2 cursor-pointer"   
        />
        <hr className="border-gray-300 mb-8" />

        <MenuItems setSidebarOpen={setSidebarOpen} />

        <Link
          href="/auth/createPost"
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-linear-to-r
            from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95
              transition text-white cursor-pointer"
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(prev => !prev)} 
            className="flex gap-2 items-center cursor-pointer"
          >
            <Image 
              src={assets.sample_profile} 
              alt="Profile-Image" 
              className="w-8 h-8 aspect-square rounded-full" 
            />
            <div>
              <h1 className="text-sm font-medium">{user?.name}</h1>
              <p className="text-xs text-gray-500">@{user?.name}</p>
            </div>
          </div>

          {
            dropdownOpen
              &&
            <div 
              className="absolute bottom-full mb-2 left-0 w-48 bg-white border border-gray-200
                rounded-lg shadow-lg z-10"
            >
              <Link
                href={`/auth/profileUpdate/${user?.id}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Update Pofile
              </Link>

              <button
                onClick={handleLogout} 
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          }
        </div>

        <LogOut 
          onClick={handleLogout} 
          className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer" 
        />
      </div>
    </div>
  )
}

export default Sidebar
