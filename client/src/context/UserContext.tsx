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
    created_at?: Date;
    is_verified?: number;
    updated_at?: Date;

    // Relational & computed fields 
    followers_count?: number;
    followers?: string[];
    following?: string[];
    connections?: string[];
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

export type StoryType = {
    id: number;
    background_color: string;
    content: string;
    created_at: Date;
    media_type: string;
    media_url: string;
    updated_at: Date;
    user_id: number;
    user: {
        id: number;
        full_name: string;
        profile_picture: string;
        user_name: string;
    }
    views_count: string[];
};

type RelationUser = {
    id: number;
    full_name: string;
    user_name: string;
    profile_picture?: string;
    bio?: string;
};

type ConnectionType = {
    connections: RelationUser[];
    followers: RelationUser[];
    following: RelationUser[];
    pendingConnections: RelationUser[];
    incomingConnections: RelationUser[];
};

type MessageType = {            
    id: number;
    from_user: {
        id: number;
        full_name: string;
        username: string;
        profile_picture: string;
    };
    to_user: {
        id: number;
        full_name: string;
        username: string;
        profile_picture: string;
    };
    from_user_id: number;
    to_user_id: number;
    text: string;
    message_type: string;
    media_url: string;
    created_at?: Date;
    updated_at?: Date;
    seen: boolean;
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
    stories: StoryType[];
    fetchStories: () => Promise<void>;
    fetchConnections: () => Promise<void>;
    relations: ConnectionType;
    toggleFollow: (userId: number | string) => Promise<void>;
    toggleConnectionRequest: (userId: string | number) => Promise<void>;
    acceptConnectionRequest: (userId: number | string) => Promise<void>;
    declineConnectionRequest: (userId: number | string) => Promise<void>;
    messages: MessageType[]; 
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
    sendMessage: (userId: number | string, text?: string, mediaUrl?: string) => Promise<void>; 
    fetchChatMessages: (userId: number | string) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [feeds, setFeeds] = useState<FeedsData[]>([]);
    const [feedLoading, setFeedLoading] = useState(false);
    const [userPosts, setUserPosts] = useState<FeedsData[]>([]);
    const [otherUser, setOtherUser] = useState<UserData | null>(null);
    const [stories, setStories] = useState<StoryType[]>([]);
    const [relations, setRelations] = useState<ConnectionType>({
        connections: [],
        followers: [],
        following: [],
        pendingConnections: [],
        incomingConnections: []
    });
    const [messages, setMessages] = useState<MessageType[]>([]);

    const router = useRouter();

    const refreshUser = async () => {
        try {
            setLoading(true);

            const { data } = await axios.get("/api/user");

            if (data) {
                setUser({
                    ...data,
                    following: data.following?.map((f: any) =>
                        typeof f === "object" ? String(f.id) : String(f)
                    ) ?? [],
                    followers: data.followers?.map((f: any) =>
                        typeof f === "object" ? String(f.id) : String(f)
                    ) ?? [],
                });
            }
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

    const fetchStories = async () => {
        try {
            const { data } = await axios.get("/api/stories");
            if (data.success) {
                setStories(data.stories);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to fatch stories");
        }
    };

    const fetchConnections = async () => {
        try {
            const { data } = await axios.get("/api/connections");
            if (data.success) {
                setRelations({
                    connections: data.connections,
                    followers: data.followers,
                    following: data.following,
                    pendingConnections: data.pendingConnections,
                    incomingConnections: data.incomingConnections
                });

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to fatch connections");
        }
    };

    const toggleFollow = async (userId: number | string) => {
        try {
            // Check if user is already following this profile
            const isFollowing = user?.following?.some((fId) => String(fId) === String(userId));

            const { data } = await axios.post("/api/toggle-follow", { id: userId });
            if (data.success) {
                toast.success(data.message);

                // Optimistically update local state
                setUser((prevUser) => {
                    if (!prevUser) return prevUser;
                    const following = prevUser.following || [];

                    return {
                        ...prevUser,
                        following: isFollowing
                            ? following.filter((id) => String(id) !== String(userId))  // remove
                            : [...following, String(userId)]  // add
                    };
                });

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error("Toggle follow failed:", error);
            toast.error("Something went wrong while updating follow status.");
        }
    };

    const toggleConnectionRequest = async (userId: number | string) => {
        try {
            const { data } = await axios.post("/api/connections/toggle", { id: userId });
            if (data.success) {
                toast.success(data.message);
                setRelations((prev) => {
                    const alreadyPending = prev.pendingConnections.some((u) => String(u.id) === String(userId));

                    if (data.action === "sent" && data.target_user) {
                        // Add full user info directly from backend
                        return {
                            ...prev,
                            pendingConnections: [...prev.pendingConnections, data.target_user],
                        };
                    }

                    if (data.action === "cancelled") {
                        // Remove canceled request
                        return {
                            ...prev,
                            pendingConnections: prev.pendingConnections.filter((u) => String(u.id) !== String(userId))
                        };
                    }

                    return prev;
                });

                // Refresh all connections 
                await fetchConnections();

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error("toggleConnectionRequest error:", error);
            toast.error("Something went wrong.");
        }
    };

    const acceptConnectionRequest = async (userId: number | string) => {
        try {
            const { data } = await axios.post("api/connections/accept", { id: userId });
            if (data.success) {
                toast.success(data.message);
                setRelations((prev) => ({
                    ...prev,
                    incomingConnections: prev.incomingConnections.filter(
                        (u) => String(u.id) !== String(userId)
                    ),
                    connections: data.connection
                        ? [...prev.connections, data.connection]
                        : prev.connections
                }));

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error("acceptConnectionRequest error:", error);
            toast.error("Something went wrong.");
        }
    };

    const declineConnectionRequest = async (userId: number | string) => {
        try {
            const { data } = await axios.post("/api/connections/decline", { id: userId });
            if (data.success) {
                toast.success(data.message);
                setRelations((prev) => ({
                    ...prev,
                    incomingConnections: prev.incomingConnections.filter(
                        (u) => String(u.id) !== String(data.declined_user_id)
                    )
                }));

            } else {
                toast.error(data.message);
            }

        } catch (error) {
            console.error("declineConnectionRequest error:", error);
            toast.error("Something went wrong.");
        }
    };

    const sendMessage = async (userId: number | string, text?: string, media_url?: string) => {
        try {
            if (!text && !media_url) {
                toast.error("Cannot send empty message");
                return;
            }

            const payload = {
                to_user_id: userId,
                text: text || null,
                media_url: media_url || null
            };

            const { data } = await axios.post("/api/messages/send", payload);
            if (data.success && data.message) {
                const newMessage = data.message;

                // Optimistically add to local chat
                setMessages((prev) => [...prev, newMessage]);
            }

        } catch (error) {
            console.error("sendMessage error:", error);
            toast.error("Failed to send message");
        }
    };

    const fetchChatMessages = async (userId: number | string) => {
        try {
            const { data } = await axios.post("/api/messages/get-messages", { to_user_id: userId });
            if (data.success) {
                setMessages(data.messages);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch messages");
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
        likePost,
        stories,
        fetchStories,
        fetchConnections,
        relations,
        toggleFollow,
        toggleConnectionRequest,
        acceptConnectionRequest,
        declineConnectionRequest,
        messages, setMessages,
        sendMessage,
        fetchChatMessages
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
};

export default UserContextProvider;