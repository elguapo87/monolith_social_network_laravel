"use client"

import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function AuthLayout({ children } : { children: React.ReactNode }) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AuthGuard>
            <Toaster />
            <div className="relative w-full h-screen flex">
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="flex-1 bg-slate-50">
                    {children}
                </div>

                {
                    sidebarOpen
                        ?
                    <X
                        onClick={() => setSidebarOpen(false)}
                        className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow
                            w-10 h-10 text-gray-600 sm:hidden" 
                    />
                        :
                    <Menu 
                        onClick={() => setSidebarOpen(true)}
                        className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow
                            w-10 h-10 text-gray-600 sm:hidden"
                    />
                }
            </div>
        </AuthGuard>
    )
}