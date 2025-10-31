"use client"

import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";

export type UserData = {
    id: number;
    full_name: string;
    user_name: string;
    email: string;
    profile_picture?: string;
    cover_photo?: string;
    bio: string;
    location: string | null;
    created_at: Date;
    followers: string[];
    following: string[];
}

export type FeedsData = {        
    author: {
        id: number;
        profile_picture: string;
        full_name: string;
        user_name: string;
    }
    content: string;
    created_at?: Date;
    id: number; 
    image_urls: string[];
    liked_by_me?: boolean;
    likes: number[];
    likes_count: number;
    post_type: string;
};

interface UserContextType {
    user: UserData | null;
    setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    refreshUser: () => Promise<void>;
    loading: boolean;
    updateUser: (formData: FormData) => Promise<boolean | undefined>;
    feeds: FeedsData[];                                             
    setFeeds: React.Dispatch<React.SetStateAction<FeedsData[]>>;
    fetchFeedPosts: () => Promise<void>; 
    feedLoading: boolean;
    userPosts: FeedsData[];
    fetchUserPosts: (id?: number | string) => Promise<void>;
    otherUser: UserData | null;
    setOtherUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    fetchSelectedUser: (id: number | string) => Promise<void>;
    likePost: (postId: number | string) => Promise<void>; 
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [feeds, setFeeds] = useState<FeedsData[]>([]);
    const [feedLoading, setFeedLoading] = useState(false);
    const [userPosts, setUserPosts] = useState<FeedsData[]>([]);
    const [otherUser, setOtherUser] = useState<UserData | null>(null);

    const router = useRouter();

    const refreshUser = async () => {
        setLoading(true);

        try {
            const { data } = await axios.get("/api/user");
            setUser(data);

        } catch (error) {
            // If it's a 401, make sure user is null and optionally redirect
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                setUser(null);
                router.push("/");

            } else {
                // other errors: treat as not-logged-in but keep silent
                setUser(null);
            }

        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (formData: FormData): Promise<boolean | undefined> => {
        try {
            const { data } = await axios.post("/api/user/update", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (data.success) {
                setUser(data.user);
                toast.success(data.message);
                return true;

            } else {
                toast.error(data.message);
                return false;
            }

        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors?.user_name) {
                    toast.error(errors.user_name[0]);
                    return false;

                } else {
                    toast.error("Validation failed");
                    return false;
                }
            } else {
                toast.error("Failed to update profile");
            }
            return false;
        }
    };

    const fetchFeedPosts = async () => {
        try {
            setFeedLoading(true);
            const { data } = await axios.get("/api/posts/feed-posts");
            if (data.success) {
                setFeeds(data.posts);
            }

        } catch (error) {
            console.error(error);
            throw error;

        } finally {
            setFeedLoading(false);
        }
    };

    const fetchUserPosts = async (id?: number | string) => {
        try {
            setFeedLoading(true);

            const url = id ? `/api/users/${id}/posts` : "/api/my-posts";
            
            const { data } = await axios.get(url);
            if (data.success) {
                setUserPosts(data.posts);
            }

        } catch (error) {
            console.error(error);
            throw error;

        } finally {
            setFeedLoading(false);
        }
    };

    const fetchSelectedUser = async (id: number | string) => {
        try {
            const { data } = await axios.get(`/api/users/${id}`);
            if (data.success) {
                setOtherUser(data.user);
            }

        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const likePost = async (postId: number | string) => {
        try {
            const { data } = await axios.post(`/api/posts/${postId}/like`);
            if (data.success) {
                toast.success(data.message);

                setFeeds(prev => 
                    prev.map(post =>
                        post.id === postId
                            ? {
                                ...post,
                                liked_by_me: data.isLiked,
                                likes_count: data.likes_count ?? post.likes_count
                            }
                            : post
                    )
                );

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const value = {
        user, setUser,
        refreshUser,
        loading,
        updateUser,
        feeds, setFeeds,
        fetchFeedPosts,
        feedLoading,
        userPosts,
        fetchUserPosts,
        otherUser, setOtherUser,
        fetchSelectedUser,
        likePost
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
};

export default UserContextProvider;