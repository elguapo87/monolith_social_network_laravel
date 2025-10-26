import Image, { StaticImageData } from "next/image";
import { assets, dummyUserData } from "../../public/assets"
import { MapPin, MessageCircle, Plus, UserPlus } from "lucide-react";

type UserProps = {
    user: {
        _id: string;
        email: string;
        full_name: string;
        username: string;
        bio: string;
        profile_picture: StaticImageData | string;
        cover_photo: StaticImageData | string;
        location: string;
        followers: string[];
        following: string[];
        connections: string[];
        posts: never[];
        is_verified: boolean;
        createdAt: string;
        updatedAt: string;
    };
};

const UserCard = ({ user }: UserProps) => {

    const currentUser = dummyUserData;

    const handleFollow = async () => {

    };

    const handleConnectionRequest = async () => {

    };

    return (
        <div
            key={user._id}
            className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md"
        >
            <div className="text-center">
                <Image 
                    src={user.profile_picture || assets.avatar_icon} 
                    alt="" 
                    width={100} 
                    height={200} 
                    className="rounded-full w-16 shadow-md mx-auto" 
                />

                <p className="mt-4 font-semibold">{user.full_name}</p>
                {user.username && <p className="text-gray-600 font-light">@{user.username}</p>}
                {user.bio && <p className="text-gray-600 mt-2 text-center text-sm px-4">@{user.bio}</p>}
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <MapPin className="w-4 h-4" /> {user.location}
                </div>

                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <span>{user.followers.length}</span> Followers
                </div>
            </div>

            <div className="flex mt-4 gap-2">
                {/* FOLLOW BUTTON */}   
                <button 
                    onClick={handleFollow}
                    disabled={currentUser?.followers.includes(user._id)}
                    className="w-full py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r
                        from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
                        active:scale-95 transition text-white cursor-pointer"
                >
                    <UserPlus className="w-4 h-4" /> 
                    {currentUser?.following.includes(user._id) ? "Following" : "Follow"}
                </button>

                {/* CONNECTION REQUEST BUTTON / MESSAGE BUTTON */}
                <button
                    onClick={() => handleConnectionRequest} 
                    className="flex items-center justify-center w-16 border text-slate-500 group rounded-md
                        cursor-pointer active:scale-95 transition"
                >
                    {
                        currentUser.connections.includes(user._id)
                            ?
                        <MessageCircle className="w-5 h-5 group-hover:scale-105 transition" />
                            :
                        <Plus className="w-5 h-5 group-hover:scale-105 transition" />
                    }    
                </button>
            </div>
        </div>
    )
}

export default UserCard