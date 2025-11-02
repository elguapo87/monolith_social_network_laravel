"use client"

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react"
import { assets } from "../../../../public/assets";
import { MessageSquare, UserCheck, UserPlus, UserRoundPen, Users } from "lucide-react";
import Image from "next/image";
import { UserContext } from "@/context/UserContext";

const Connections = () => {

    const context = useContext(UserContext);
    if (!context) throw new Error("Connections must be within UserContextProvider");
    const {
        relations,
        fetchConnections,
        toggleFollow,
        user,
        toggleConnectionRequest,
        acceptConnectionRequest,
        declineConnectionRequest
    } = context;


    const [currentTab, setCurrentTab] = useState("Followers");

    const router = useRouter();

    const dataArray = [
        { label: "Followers", value: relations.followers, icon: Users },
        { label: "Following", value: relations.following, icon: UserCheck },
        { label: "Pending", value: relations.pendingConnections, icon: UserRoundPen },
        { label: "Incoming", value: relations.incomingConnections, icon: UserRoundPen },
        { label: "Connections", value: relations.connections, icon: UserPlus },
    ]

    useEffect(() => {
        fetchConnections();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto p-6">

                {/* TITLE */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Connections</h1>
                    <p className="text-slate-600">Manage your network and discover new connections</p>
                </div>

                {/* COUNTS */}
                <div className="mb-8 flex flex-wrap gap-6">
                    {dataArray.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-center gap-1 border h-20 w-40
                             border-gray-200 bg-white shadow rounded-md"
                        >
                            <b>{item.value.length}</b>
                            <p className="text-slate-600">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* TABS */}
                <div
                    className="inline-flex flex-wrap items-center border border-gray-200
                     rounded-md p-1 bg-white shadow-sm"
                >
                    {dataArray.map((tab) => (
                        <button
                            onClick={() => setCurrentTab(tab.label)}
                            key={tab.label}
                            className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors
                                cursor-pointer ${currentTab === tab.label ?
                                    "bg-white font-medium text-black" : "text-gray-500 hover:text-black"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="ml-1">{tab.label}</span>

                            {tab.value.length !== undefined && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                    {tab.value.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* CONNECTIONS */}
                <div className="flex flex-wrap gap-6 mt-6">
                    {dataArray.find((item) => item.label === currentTab)?.value.map((user) => (
                        <div
                            key={user.id}
                            className="w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md"
                        >
                            <Image
                                src={user.profile_picture || assets.avatar_icon}
                                alt=""
                                width={48}
                                height={48}
                                className="rounded-full w-12 h-12 shadow-md mx-auto"
                            />

                            <div className="flex-1">
                                <p className="font-medium text-slate-700">{user.full_name}</p>
                                <p className="text-slate-500">@{user.user_name}</p>
                                <p className="text-sm text-slate-600">
                                    {user.bio && user.bio.slice(0, 30)}...
                                </p>

                                <div className="flex max-sm:flex-col gap-2 mt-4">
                                    <button
                                        onClick={() => router.push(`/auth/profile/${user.id}`)}
                                        className="w-full p-2 text-sm rounded bg-linear-to-r 
                                        from-indigo-500 to-purple-600 hover:from-indigo-600
                                         hover:to-purple-700 active:scale-95 transition
                                         text-white cursor-pointer"
                                    >
                                        Profile
                                    </button>

                                    {currentTab === "Following" && (
                                        <button
                                            onClick={() => toggleFollow(user.id)}
                                            className="w-full p-2 text-sm rounded bg-slate-100
                                             hover:bg-slate-200 text-black active:scale-95
                                                transition cursor-pointer"
                                        >
                                            Unfollow
                                        </button>
                                    )}

                                    {currentTab === "Pending" && (
                                        <button
                                            onClick={() => toggleConnectionRequest(user.id)}
                                            className="w-full p-2 text-sm rounded bg-slate-100
                                             hover:bg-slate-200 text-black active:scale-95
                                              transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    {currentTab === "Incoming" && (
                                        <>
                                            <button
                                                onClick={() => acceptConnectionRequest(user.id)}
                                                className="w-full p-2 text-sm rounded bg-slate-100
                                                 hover:bg-slate-200 text-black active:scale-95
                                                transition cursor-pointer"
                                            >
                                                Accept
                                            </button>

                                            <button
                                                onClick={() => declineConnectionRequest(user.id)}
                                                className="w-full p-2 text-sm rounded bg-slate-100
                                                 hover:bg-slate-200 text-black active:scale-95 
                                                 transition cursor-pointer"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {currentTab === "Connections" && (
                                        <button
                                            onClick={() => router.push(`/auth/chatBox/${user.id}`)}
                                            className="w-full p-2 text-sm rounded bg-slate-100
                                             hover:bg-slate-200 text-black active:scale-95
                                              transition cursor-pointer flex items-center justify-center gap-1"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Message
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Connections
