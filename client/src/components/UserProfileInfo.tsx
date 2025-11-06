import { Calendar, MapPin, PenBox, Verified } from "lucide-react";
import moment from "moment";
import Image, { StaticImageData } from "next/image";
import { assets } from "../../public/assets";
import { FeedsData, UserContext, UserData } from "@/context/UserContext";
import { useContext } from "react";

type ProfileProps = {
    profile: UserData | null;
    posts: FeedsData[];
    profileId: string | number;
    setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserProfileInfo = ({ profile, posts, profileId, setShowEdit }: ProfileProps) => {

    const context = useContext(UserContext);                                                     
    if (!context) throw new Error("UserProfileInfo must be inside UserContextProvider");
    const { user } = context

    return (
        <div className="relative py-4 px-6 md:px-8 bg-white">
            <div className="flex flex-col md:flex-row items-start gap-6">

                <div className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-fulls">
                    {profile?.profile_picture && (
                        <Image 
                            src={profile.profile_picture || assets.avatar_icon} 
                            alt=""
                            width={128}                                   
                            height={128}  
                            className="absolute aspect-square rounded-full z-2" />
                    )}
                </div>

                <div className="w-full pt-16 md:pt-0 md:pl-36">
                    <div className="flex flex-col md:flex-row items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
                                <Verified className="w-6 h-6 text-blue-500" />
                            </div>

                            <p className="text-gray-600">
                                {profile?.user_name ? `@${profile.user_name}` : "Add a username"}
                            </p>
                        </div>

                        {/* If user is not on others profile that means he is opening his profile so we will give edit button */}
                        {
                            Number(user?.id) === Number(profileId)
                                &&
                            <button
                                onClick={() => setShowEdit(true)} 
                                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2
                                    rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer"
                            >
                                <PenBox className="w-4 h-4" />
                                Edit
                            </button>
                        }
                    </div>

                    <p className="text-gray-700 text-sm max-w-md mt-4">{profile?.bio}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {profile?.location ? profile.location : "Add location"}
                        </span>

                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Joined <span className="font-medium">{moment(profile?.created_at).fromNow()}</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6 mt-6 border-t border-gray-200 pt-4">
                        <div>
                            <span className="sm:text-xl font-bold text-gray-900">{posts.length}</span>
                            <span className="text-xs sm:text-sm text-gray-500 ml-1.5">Posts</span>
                        </div>
                        <div>
                            <span className="sm:text-xl font-bold text-gray-900">{profile?.followers?.length ?? 0}</span>
                            <span className="text-xs sm:text-sm text-gray-500 ml-1.5">Followers</span>
                        </div>
                        <div>
                            <span className="sm:text-xl font-bold text-gray-900">{profile?.following?.length ?? 0}</span>
                            <span className="text-xs sm:text-sm text-gray-500 ml-1.5">Following</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfileInfo
