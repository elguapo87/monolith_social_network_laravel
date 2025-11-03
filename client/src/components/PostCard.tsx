import { useContext, useEffect, useState } from "react";
import { assets } from "../../public/assets"
import Image from "next/image";
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { FeedsData, UserContext } from "@/context/UserContext";
import PostComments from "./PostComments";



const PostCard = ({ post }: { post: FeedsData }) => {

    const context = useContext(UserContext);                                             
    if (!context) throw new Error("PostCard must be within UserContextProvider");
    const { likePost, commentsCount, fetchCommentsCount } = context

    const [showComments, setShowComments] = useState(false);

    const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');

    const router = useRouter();

    const commentsLength = commentsCount[post.id] || [];

    useEffect(() => {
        fetchCommentsCount(post.id);
    }, [post.id]);

    console.log(commentsLength);
    

    return (
        <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
            {/* USER INFO */}
            <div
                onClick={() => router.push(`/auth/profile/${post.author.id}`)} 
                className="inline-flex items-center gap-3 cursor-pointer"
            >
                <Image 
                    src={post.author.profile_picture || assets.avatar_icon} 
                    alt="" 
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full shadow"
                />

                <div>
                    <div className="flex items-center space-x-1">
                        <span>{post.author.full_name}</span>
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                    </div>

                    <div className="text-gray-500 text-sm">
                        @{post.author.user_name} &bull; {moment(post.created_at).fromNow()}
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            {post.content && (
                <div
                    onClick={() => router.push(`/auth/post/${post.id}`)}
                    className="text-gray-800 text-sm whitespace-pre-line cursor-pointer"
                        dangerouslySetInnerHTML={{__html: postWithHashtags}} 
                />
            )}

            {/* IMAGES */}
            <div 
                onClick={() => router.push(`/auth/post/${post.id}`)}
                className="grid grid-cols-2 gap-2 cursor-pointer"
            >
                {post.image_urls.map((img, index) => (
                    <Image 
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

            {/* ACTIONS */}
            <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
                <div className="flex items-center gap-1">
                    <Heart
                        onClick={() => likePost(post.id)}
                        className={`w-4 h-4 cursor-pointer 
                            ${post.liked_by_me && "text-red-500 fill-red-500"}`} 
                    />
                    <span>{post.likes_count}</span>
                </div>

                <div onClick={() => setShowComments(prev => !prev)} className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{commentsLength}</span>
                </div>

                <div className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    <span>{7}</span>
                </div>
            </div>

            {showComments && <PostComments />}
        </div>
    )
}

export default PostCard
