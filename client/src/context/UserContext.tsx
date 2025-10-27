"use client"

import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";

type UserData = {
    id: number;
    full_name: string;
    user_name: string;
    email: string;
    profile_picture?: string;
    cover_photo?: string;
    bio: string;
    location: string | null;
}

interface UserContextType {
    user: UserData | null;
    setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    refreshUser: () => Promise<void>;
    loading: boolean;
    updateUser: (formData: FormData) => Promise<boolean | undefined>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        refreshUser();
    }, []);

    const value = {
        user, setUser,
        refreshUser,
        loading,
        updateUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
};

export default UserContextProvider;