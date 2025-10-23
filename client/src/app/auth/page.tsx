"use client"

import { UserContext } from "@/context/UserContext";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useContext } from "react";

const Feed = () => {

    const context = useContext(UserContext);
    if (!context) throw new Error("Feed must be inside UserContextProvider");
    const { setUser } = context;

    const router = useRouter();

    const handleLogout = async () => {
        try {
            await axios.post("/api/logout");
            setUser(null);
            router.push("/");

        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "An unknown error occurred"
            console.error("Logout failed:", errMessage);
        }
    };

    return (
        <div className="px-2 flex items-center justify-between">
            Feed
            <button
                onClick={() => handleLogout()}
                className="px-2 py-1 bg-blue-500 text-stone-100 rounded border-none">
                Logout
            </button>
        </div>
    )
}

export default Feed
