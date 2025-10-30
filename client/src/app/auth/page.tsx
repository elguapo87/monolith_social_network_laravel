"use client"

import { UserContext } from "@/context/UserContext";
import { useContext, useEffect } from "react";
import Loading from "@/components/Loading";
import StoriesBar from "@/components/StoriesBar";
import PostCard from "@/components/PostCard";
import RecentMessages from "@/components/RecentMessages";


const Feed = () => {

    const context = useContext(UserContext);
    if (!context) throw new Error("Feed must be inside UserContextProvider");
    const { feeds, feedLoading, fetchFeedPosts } = context;
    
    useEffect(() => {
        fetchFeedPosts();
    }, []);

    return (
        <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
            {/* STORIES AND POST LIST */}
            <div className="">
                <StoriesBar />

                <div className="p-4 space-y-6">
                    {feedLoading ? (
                        <Loading />
                    ) : feeds.length > 0 ? (
                        feeds.map((post) => <PostCard key={post.id} post={post} />)
                    ) : (
                        <p className="text-center text-slate-500">There are no posts yet.</p>
                    )}
                </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="max-xl:hidden sticky top-0">
                <RecentMessages />
            </div>
        </div>
    ) 
}

export default Feed
