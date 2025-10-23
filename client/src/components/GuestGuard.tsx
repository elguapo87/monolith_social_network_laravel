import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useContext } from "react";

export default function GuestGuard({ children } : { children: React.ReactNode }) {
    const context = useContext(UserContext);
    if (!context) throw new Error("GuestGuard must be inside UserContextProvider");
    const { user, loading } = context;

    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/auth"); // redirect authenticated users to dashboard
        }
    }, [user, router, loading]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Checking session...</p>
            </div>
        )
    }

    return <>{children}</>
}
