"use client"

import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { useParams } from "next/navigation";
import { assets } from "../../../../../public/assets";
import { ImageKitClient } from "imagekitio-next";
import axios from "axios";

interface MyImageKitOptions {                
    publicKey: string;
    urlEndpoint: string;
    authenticationEndpoint: string;
};

const ChatBox = () => {

    const context = useContext(UserContext);                                                  
    if (!context) throw new Error("Messages must be within UserContextProvider");
    const { messages, fetchChatMessages, sendMessage, fetchSelectedUser, otherUser, user } = context;

    const { userId } = useParams();
    const numericUserId = Number(userId);

    const [text, setText] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const messageEndRef = useRef<HTMLDivElement | null>(null);

    const handleSendMessage = async () => {
        try {
            if (!text && !image) return;

            let mediaUrl: string | undefined = undefined;
            if (image) {
                const imageKit = new ImageKitClient({
                    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
                    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
                    authenticationEndpoint: "http://localhost:8000/api/imagekit-auth",
                } as MyImageKitOptions);

                const { data: authData } = await axios.get("/api/imagekit-auth");
                const uploadRes = await imageKit.upload({
                    file: image,
                    fileName: `${Date.now()}_${image.name}`,
                    folder: "/monolith/messages",
                    signature: authData.signature,
                    token: authData.token,
                    expire: authData.expire,
                });
                
                mediaUrl = uploadRes.url;
            }

            // Send the message to backend (text or image)
            await sendMessage(numericUserId, text, mediaUrl);
            setText("");
            setImage(null);

            // Scroll to bottom after sending
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });

        } catch (error) {
            console.error("handleSendMessage error:", error);
        }
    };

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        fetchSelectedUser(numericUserId);
        fetchChatMessages(numericUserId);
    }, [numericUserId]);

    return otherUser && (
        <div className="flex flex-col h-screen">
            <div
                className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-linear-to-r from-indigo-50
                    to-purple-50 border-b border-gray-300"
            >
                <Image
                    src={otherUser.profile_picture || assets.avatar_icon} 
                    alt="" 
                    width={32}
                    height={32}
                    className="size-8 rounded-full" />
                <div>
                    <p className="font-medium">{otherUser.full_name}</p>
                    <p className="text-sm text-gray-500 -mt-1.5">@{otherUser.user_name}</p>
                </div>
            </div>

            <div className="p-5 md:px-10 h-full overflow-y-scroll">
                <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.toSorted((a, b) => new Date(a.created_at ?? "").getTime() - new Date(b.created_at ?? "").getTime()).map((message, index) => (
                        <div 
                            key={index} 
                            className={`flex flex-col ${message.to_user_id !== otherUser.id 
                                ? "items-start" : "items-end"}`}
                        >
                            <div 
                                className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow
                                    ${message.to_user_id !== otherUser.id ? "rounded-bl-none" : "rounded-br-none"}`}
                            >
                                {
                                    message.message_type === "image"
                                        &&
                                    <Image
                                        src={message.media_url} 
                                        alt=""
                                        width={500}
                                        height={500} 
                                        className="w-full max-w-sm rounded-lg mb-1" 
                                    />
                                }
                                <p>{message.text}</p>
                            </div>
                        </div>
                    ))}

                    <div ref={messageEndRef} />
                </div>
            </div>

            <div className="px-4">
                <div 
                    className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border 
                        border-gray-200 shadow rounded-full mb-5"
                >
                    <input
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} 
                        type="text" 
                        className="flex-1 outline-none text-slate-700" 
                        placeholder="Type a message..." 
                    />

                    <label htmlFor="image">
                            <div className="relative">
                                {image ? (
                                    <>
                                        <Image 
                                            src={URL.createObjectURL(image)} 
                                            width={100} 
                                            height={100} 
                                            alt="" 
                                            className="h-8 rounded" 
                                        />
                                        <div 
                                            onClick={(e) => {
                                                e.preventDefault();  
                                                e.stopPropagation();  
                                                setImage(null);
                                            }}
                                            
                                            className="absolute -top-4 -right-3 text-black font-bold
                                                cursor-pointer hover:scale-105 transition-all"
                                        >
                                            X
                                        </div>
                                    </>
                                ) : (
                                    <ImageIcon className="size-7 text-gray-400 cursor-pointer" />
                                )}
                            </div>
                        <input 
                            onChange={(e) => e.target.files && setImage(e.target.files[0])} 
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            type="file" 
                            id="image" 
                            accept="image/*" 
                            hidden 
                        />
                    </label>

                    <button
                        onClick={handleSendMessage}
                        className="bg-linear-to-br from-indigo-500 to-purple-600 hover:from-indigo-700
                            hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full"
                    >
                        <SendHorizonal size={18} /> 
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatBox