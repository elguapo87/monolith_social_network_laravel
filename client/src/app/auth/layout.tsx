import AuthGuard from "@/components/AuthGuard";
import { Toaster } from "react-hot-toast";

export default function AuthLayout({ children } : { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <Toaster />
            {children}
        </AuthGuard>
    )
}