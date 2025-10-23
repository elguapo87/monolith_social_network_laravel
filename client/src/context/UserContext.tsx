"use client"

import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";

type UserData = {
    id: number;
    name: string;
    email: string;
}

interface UserContextType {
    user: UserData | null;
    setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    refreshUser: () => Promise<void>;
    loading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const UserContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const refreshUser = async () => {
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

    useEffect(() => {
        refreshUser();
    }, []);

    const value = {
        user, setUser,
        refreshUser,
        loading
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
};

export default UserContextProvider;