"use client"

import { FeedsData, UserContext } from "@/context/UserContext";
import axios from "@/lib/axios";
import { BadgeCheck, Heart, MessageCircle, Share2, X } from "lucide-react";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assets } from "../../public/assets";
import moment from "moment";
import PostComments from "./PostComments";

type Props = {
    post?: FeedsData;
    setShowPost?: React.Dispatch<React.SetStateAction<boolean>>;
    postId?: number;
    fullPage?: boolean;
};

const PostModal = ({ setShowPost, post: initialPost, postId, fullPage }: Props) => {

    const context = useContext(UserContext);
    if (!context) throw new Error("PostModal must be within UserContextProvider");
    const { commentsCount, fetchCommentsCount, updatePostInFeed } = context

    const [showComments, setShowComments] = useState(false);
    const [post, setPost] = useState<FeedsData | null>(initialPost ?? null);

    const commentsLength = post ? (commentsCount[post.id] || 0) : 0;

    // Fetch post if it's opened in fullPage mode
    useEffect(() => {
        const fetchPost = async () => {
            if (!fullPage || !postId) return;

            try {
                await axios.get("/sanctum/csrf-cookie");

                const { data } = await axios.get(`/api/posts/${postId}`);
                if (data.success) {
                    setPost({
                        ...data.post,
                        likes_count: data.post.likes_count ?? data.post.likes?.length ?? 0
                    })

                } else {
                    toast.error(data.message);
                }

            } catch (error) {
                toast.error("Post not found");
            }
        };

        fetchPost();
    }, [postId, fullPage]);

    useEffect(() => {
        if (postId && fullPage) {
            fetchCommentsCount(postId);
        }
    }, [postId, fullPage]);

    const handleLike = async () => {
        if (!post) return;

        try {
            const { data } = await axios.post(`/api/posts/${post.id}/like`);
            if (data.success) {
                toast.success(data.message);

                setPost(prev => prev ? {
                    ...prev,
                    liked_by_me: data.isLiked,
                    likes_count: data.likes_count ?? prev.likes_count
                } : prev);

                // Sync global feed state
                updatePostInFeed(post.id, data.isLiked, data.likes_count);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to like post.");
        }
    };

    const postWithHashtags = post?.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');

    const handleShare = async (postId: number) => {
        const postUrl = `${window.location.origin}/auth/post/${postId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Check out this post!",
                    text: "I found this post interesting:",
                    url: postUrl,
                });
            } catch (err) {
                console.log("Share cancelled or failed:", err);
            }
        } else {
            navigator.clipboard.writeText(postUrl);
            toast.success("Post link copied to clipboard!");
        }
    };

    return (
        <div
            className={`${fullPage
                ? "min-h-screen bg-gray-50 text-black flex justify-center p-6"
                : "fixed inset-0 z-110 min-h-screen bg-black/90 backdrop-blur text-white flex justify-center p-4"
                }`}
        >
            <div
                className={`relative w-full max-w-xl md:max-w-3xl bg-stone-100 rounded-md 
                    ${fullPage ? "shadow-xl" : "max-h-[100vh]"}`}
            >

                {!fullPage && setShowPost && (
                    <button
                        onClick={() => setShowPost(false)}
                        className='absolute top-3 right-3 cursor-pointer text-black'>
                        <X
                        />
                    </button>
                )}


                {/* POST AUTHOR */}
                <div className='flex items-center gap-1 mt-5 px-5 md:px-10'>
                    <Image
                        src={post?.author?.profile_picture || assets.avatar_icon}
                        alt=''
                        width={50}
                        height={50}
                        className='size-12.5 rounded-full shadow'
                    />
                    <div>
                        <div className="flex items-center space-x-1">
                            <span className='text-gray-800'>{post?.author?.full_name}</span>
                            <BadgeCheck className="w-4 h-4 text-blue-500" />

                        </div>
                        <div className="text-gray-500 text-sm">
                            @{post?.author.user_name} &bull; {moment(post?.created_at).fromNow()}
                        </div>
                    </div>
                </div>

                <hr className='w-full text-gray-300 my-3' />

                {/* POST CONTENT */}
                <div className='overflow-y-scroll max-h-[30vh] md:max-h-[45vh]'>

                    <div
                        {...(!fullPage && setShowPost ? { onClick: () => setShowPost(true) } : {})}
                        className="text-gray-800 px-5 md:px-10 text-base whitespace-pre-line cursor-pointer"
                        dangerouslySetInnerHTML={{ __html: postWithHashtags ?? "" }}
                    />


                    {/* IMAGES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 cursor-pointer px-5 md:px-10 mt-3"
                        onClick={() => setShowPost && setShowPost(true)}
                    >

                        {post?.image_urls.map((img, index) => (
                            <Image
                                onClick={() => window.open(img, "_blank")}
                                key={index}
                                src={img}
                                alt=""
                                width={500}
                                height={500}
                                className={`w-full h-48 object-cover rounded-lg 
                                    ${post.image_urls.length === 1 && "col-span-2 h-auto"}`}
                            />
                        ))}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="px-5 md:px-10 flex items-center gap-4 text-gray-600 text-sm pt-2 mt-2 border-t border-gray-300">
                    <div className="flex items-center gap-1">
                        <Heart
                            onClick={handleLike}
                            className={`w-4 h-4 cursor-pointer 
                            ${post?.liked_by_me && "text-red-500 fill-red-500"}`}
                        />
                        <span>{post?.likes_count}</span>
                    </div>

                    <div className="flex items-center gap-1" >
                        <MessageCircle
                            onClick={() => setShowComments(prev => !prev)}
                            className="w-4 h-4 cursor-pointer"
                        />
                        <span>{commentsLength}</span>
                    </div>

                    {!fullPage && (
                        <div className="flex items-center gap-1">
                            <Share2 onClick={() => post && handleShare(post.id)} className="w-4 h-4" />
                        </div>

                    )}
                </div>

                {showComments && post && (
                    <div className='px-5 md:px-10'>
                        <PostComments postId={post.id} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default PostModal
