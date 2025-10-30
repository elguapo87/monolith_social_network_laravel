"use client"

import { useContext, useState } from "react"
import Image from "next/image";
import { X, Image as ImageIcon } from "lucide-react";
import axios from "@/lib/axios";
import { ImageKitClient } from "imagekitio-next";
import toast from "react-hot-toast";
import { UserContext } from "@/context/UserContext";
import { assets } from "../../../../public/assets";

interface MyImageKitOptions {
    publicKey: string;
    urlEndpoint: string;
    authenticationEndpoint: string;
};

const CreatePost = () => {

    const context = useContext(UserContext);                                           
    if (!context) throw new Error("CreatePost must be within UserContextProvider");
    const { user } = context;

    const [content, setContent] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await axios.get("/sanctum/csrf-cookie");

            const imageKit = new ImageKitClient({
                publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
                urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
                authenticationEndpoint: "http://localhost:8000/api/imagekit-auth",
            } as MyImageKitOptions);

            const uploadUrls: string[] = [];
            for (const image of images) {
                // fetch fresh token per upload
                const { data: authData } = await axios.get("/api/imagekit-auth");

                const uploadRes = await imageKit.upload({
                    file: image,
                    fileName: `${Date.now()}_${image.name}`,
                    folder: "/monolith/posts",
                    signature: authData.signature,
                    token: authData.token,
                    expire: authData.expire,
                });

                uploadUrls.push(uploadRes.url);
            }

            let postType: "text" | "image" | "text_with_image" = "text";
            if (uploadUrls.length  > 0 && content.trim() !== "") {
                postType = "text_with_image";

            } else if (uploadUrls.length > 0) {
                postType = "image";
            }

            if (content.trim() === "" && uploadUrls.length === 0) {
                toast.error("You can't publish an empty post");
                setLoading(false);
                return;
            }

            const { data } = await axios.post("/api/posts", {
                content,
                post_type: postType,
                image_urls: uploadUrls
            });
            
            if (data.success) {
                toast.success(data.message);
                setContent("");
                setImages([]);

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error("Create post error:", error);
            toast.error("Failed to create post");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
            <div className="max-w-6xl mx-auto p-6">
                {/* TITLE */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Post</h1>
                    <p className="text-slate-600">Share your thoughts with the world</p>
                </div>

                {/* FORM */}
                <div className="max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4">
                    {/* HEADER */}
                    <div className="flex items-center gap-3">
                        <Image
                            src={user?.profile_picture || assets.avatar_icon} 
                            alt=""
                            width={48}
                            height={48} 
                            className="w-12 h-12 rounded-full shadow" 
                        />
                        <div>
                            <h2 className="font-semibold">{user?.full_name}</h2>
                            <p className="text-sm text-gray-500">@{user?.user_name}</p>
                        </div>
                    </div>

                    {/* TEXT AREA */}
                    <textarea 
                        onChange={(e) => setContent(e.target.value)}
                        value={content}
                        className="w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400" 
                        placeholder="Whats happening?"
                    />

                    {/* IMAGES */}
                    {
                        images.length > 0
                            &&
                        <div className="flex flex-wrap gap-2 mt-4">
                            {images.map((image, i) => (
                                <div key={i} className="relative group">
                                    <Image 
                                        src={URL.createObjectURL(image)} 
                                        width={160}
                                        height={100} 
                                        alt="" 
                                        className="w-32 h-20 object-cover rounded-md" />

                                    <div
                                        onClick={() => setImages(images.filter((_, index) => index !== i))}
                                        className="absolute hidden group-hover:flex justify-center items-center
                                            top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    }

                    {/* BOTTOM BAR */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                        <label 
                            htmlFor="images" 
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700
                                transition cursor-pointer"
                        >
                            <ImageIcon className="size-6" />
                        </label>

                        <input 
                            onChange={(e) => {
                                if (e.target.files) {
                                    const selectedFiles = Array.from(e.target.files);
                                    setImages(prev => [...prev, ...selectedFiles]);
                                }
                            }} 
                            type="file" 
                            id="images" 
                            accept="image/*" 
                            multiple 
                            hidden 
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={loading || (content.trim() === "" && images.length === 0)} 
                            type="submit"
                            className={`text-sm bg-linear-to-r from-indigo-500 to-purple-600
                            hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white
                            font-medium px-8 py-2 rounded-md cursor-pointer ${(loading || (content.trim() === "" 
                                && images.length === 0)) ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Publishing..." : "Publish Post"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CreatePost