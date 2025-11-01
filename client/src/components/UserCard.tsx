import Image, { StaticImageData } from "next/image";
import { assets, dummyUserData } from "../../public/assets"
import { MapPin, MessageCircle, Plus, UserPlus } from "lucide-react";
import { useContext, useState } from "react";
import { UserContext, UserData } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const UserCard = ({ profile } : { profile: UserData }) => {

    const context = useContext(UserContext);                                         
    if (!context) throw new Error("AuthGuard must be within UserContextProvider");
    const { user, toggleFollow, relations, toggleConnectionRequest } = context;

    const [localFollowers, setLocalFollowers] = useState(profile.followers_count || 0);
    const [loadingFollow, setLoadingFollow] = useState(false);

    const router = useRouter();

    const isFollowing = (user?.following ?? []).some((f: any) =>                              
        typeof f === "object" ? f.id === profile.id : String(f) === String(profile.id)
    );

    const handleToggleFollow = async () => {
        if (loadingFollow) return;
        setLoadingFollow(true);

        const currentyFollowing = isFollowing;

        await toggleFollow(profile.id);

        // Optimistically update follower count
        setLocalFollowers((prev) => {
            // prevent negative values just in case
            if (currentyFollowing && prev > 0) return prev - 1;
            if (!currentyFollowing) return prev + 1;
            return prev;
        });

        setLoadingFollow(false);
    };

    const handleConnectionRequest = async () => {
        await toggleConnectionRequest(profile.id);
    };

    const isPendingSent = relations?.pendingConnections?.some((u) => String(u.id) === String(profile.id)) ?? false;
    const isPendingReceived = relations?.incomingConnections?.some((u) => String(u.id) === String(profile.id)) ?? false;
    const isConnected = relations?.connections?.some((u) => String(u.id) === String(profile.id)) ?? false;

    return (
        <div
            key={profile.id}
            className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md"
        >
            <div className="text-center">
                <Image 
                    src={profile.profile_picture || assets.avatar_icon} 
                    alt="" 
                    width={64} 
                    height={64} 
                    className="rounded-full aspect-square w-16 shadow-md mx-auto" 
                />

                <p className="mt-4 font-semibold">{profile.full_name}</p>
                {profile.user_name && <p className="text-gray-600 font-light">@{profile.user_name}</p>}
                {profile.bio && <p className="text-gray-600 mt-2 text-center text-sm px-4">{profile.bio}</p>}
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <MapPin className="w-4 h-4" /> {profile.location}
                </div>

                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <span>{(localFollowers)}</span> Followers
                </div>
            </div>

            <div className="flex mt-4 gap-2">
                {/* FOLLOW BUTTON */}   
                <button 
                    onClick={handleToggleFollow}
                    disabled={loadingFollow}
                    className={`w-full py-2 rounded-md flex justify-center items-center gap-2 transition 
                        active:scale-95 cursor-pointer ${isFollowing ? "bg-gray-300 text-gray-700 hover:bg-gray-400" : 
                            "bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"}`}
                >
                    <UserPlus className="w-4 h-4" /> 
                    {loadingFollow ? "..." : isFollowing ? "Unfollow" : "Follow"}
                </button>

                {/* CONNECTION REQUEST BUTTON / MESSAGE BUTTON */}
                <button
                    onClick={handleConnectionRequest} 
                    className={`flex items-center justify-center w-16 border text-slate-500 group rounded-md
                        cursor-pointer active:scale-95 transition ${isPendingSent || isPendingReceived ?
                        "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {isConnected ? (
                        <MessageCircle 
                            onClick={(e) => { e.stopPropagation(); router.push(`/auth/chatBox/${profile.id}`); }}
                            className="w-5 h-5 group-hover:scale-105 transition"
                        />
                    ) : isPendingSent ? (
                        <span className="text-xs font-medium text-gray-500">Pending</span>
                    ) : isPendingReceived ? (
                        <span className="text-xs font-medium text-gray-500">Requested</span>
                    ) : (
                        <Plus className="w-5 h-5 group-hover:scale-105 transition" />
                    )}    
                </button>
            </div>
        </div>
    )
}

export default UserCard