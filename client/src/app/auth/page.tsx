"use client"

import { UserContext } from "@/context/UserContext";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { dummyPostsData } from "../../../public/assets";
import Loading from "@/components/Loading";
import StoriesBar from "@/components/StoriesBar";
import PostCard from "@/components/PostCard";
import RecentMessages from "@/components/RecentMessages";

type FeedType = typeof dummyPostsData;

const Feed = () => {

    const context = useContext(UserContext);
    if (!context) throw new Error("Feed must be inside UserContextProvider");
    const { setUser } = context;

    const [feeds, setFeeds] = useState<FeedType>([]);
    const [loading, setLoading] = useState(true);

    const fetchFeeds = async () => {
        setFeeds(dummyPostsData);
        setLoading(false);
    };

    useEffect(() => {
        fetchFeeds();
    }, []);

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

    return !loading ? (
        <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
            {/* STORIES AND POST LIST */}
            <div className="">
                <StoriesBar />

                <div className="p-4 space-y-6">
                    {feeds.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="max-xl:hidden sticky top-0">
                <RecentMessages />
            </div>
        </div>
    ) : (
        <Loading />
    )
}

export default Feed
