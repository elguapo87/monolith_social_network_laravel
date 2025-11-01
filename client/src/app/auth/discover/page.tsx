"use client"

import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react';
import UserCard from '@/components/UserCard';
import Loading from '@/components/Loading';
import { UserData } from '@/context/UserContext';
import axios from '@/lib/axios';

const Discover = () => {

    const [input, setInput] = useState("");
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(false);

    // Debounce logic: triggers search 500ms after user stops typing 
    useEffect(() => {
        // If input is empty, clear results and stop
        if (input.trim() === "") {
            setUsers([]);
            setLoading(false);
            return;
        }

        const delayDebaunce = setTimeout(async () => {
            setLoading(true);

            try {
                const { data } = await axios.post("/api/discover-users", { input });
                if (data.success) {
                    setUsers(data.users);
                    setLoading(false);
                }

            } catch (error) {
                console.error("Search failed:", error);

            } finally {
                setLoading(false);
            }
        }, 500);  // 500ms debounce

        return () => clearTimeout(delayDebaunce);
        
    }, [input]);

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
            <div className="max-w-6xl mx-auto p-6">
                {/* TITLE */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Discover People</h1>
                    <p className="text-slate-600">Connect with amazing people and grow your network</p>
                </div>

                {/* SEARCH */}
                <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
                    <div className="p-6">
                        <div className="relative">
                            <Search 
                                className="absolute top-1/2 left-3 transform
                                    -translate-y-1/2 text-slate-400 w-5 h-5" 
                            />
                            <input
                                type="text"
                                onChange={(e) => setInput(e.target.value)}
                                value={input}
                                placeholder="Search people by name, username, bio, or location..."  
                                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300
                                 rounded-md max-sm:text-sm"  
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6">
                    {users.map((user) => (
                        <UserCard key={user.id} profile={user} />
                    ))}
                </div>

                {loading && <Loading height='60vh' />}
            </div>
        </div>
    )
}

export default Discover
