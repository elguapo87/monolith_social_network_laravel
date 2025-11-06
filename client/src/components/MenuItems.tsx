"use client"

import { UserContext } from "@/context/UserContext";
import { Home, MessageCircle, Search, UserIcon, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";

type SidebarProps = {
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MenuItems = ({ setSidebarOpen } : SidebarProps) => {

    const context = useContext(UserContext);
    if (!context) throw new Error("MenuItems must be inside UserContextProvider");
    const { user } = context;

    const menuItemsData = [
        { to: '/auth', label: 'Feed', Icon: Home },
        { to: '/auth/messages', label: 'Messages', Icon: MessageCircle },
        { to: '/auth/connections', label: 'Connections', Icon: Users },
        { to: '/auth/discover', label: 'Discover', Icon: Search },
        { to: user ? `/auth/profile/${user?.id}` : "#", label: 'Profile', Icon: UserIcon },
    ];

    const pathName = usePathname();

    return (
        <div className="px-6 text-gray-600 space-y-1 font-medium">
            {menuItemsData.map(({ to, label, Icon }) => {
                const isActive = pathName === to;

                return (
                    <Link
                        onClick={() => setSidebarOpen(false)}
                        key={to}
                        href={to}
                        className={`px-3.5 py-2 flex items-center gap-3 rounded-xl
                            ${isActive ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"}`}
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </Link>
                )
            })}
        </div>
    )
}

export default MenuItems
