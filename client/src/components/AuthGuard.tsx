"use client"

import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useContext } from "react";
import Loading from "./Loading";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const context = useContext(UserContext);
    if (!context) throw new Error("AuthGuard must be inside UserContextProvider");
    const { user, loading } = context;

    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/"); // redirect to login if not logged in
        }

    }, [user, loading, router]);

    if (loading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return <>{children}</>;
}