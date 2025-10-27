import { useContext, useState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { assets } from "../../public/assets";
import { ImageKitClient } from "imagekitio-next";
import axios from "@/lib/axios";

type ProfileProps = {
    setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
};

interface MyImageKitOptions {
    publicKey: string;
    urlEndpoint: string;
    authenticationEndpoint: string;
};

const ProfileModal = ({ setShowEdit }: ProfileProps) => {

    const context = useContext(UserContext);
    if (!context) throw new Error("ProfileModal must be within UserContextProvider");
    const { user, updateUser } = context;

    const [editForm, setEditForm] = useState<{
        user_name: string;
        bio: string;
        location: string;
        profile_picture: File | null;
        cover_photo: File | null;
        full_name: string;
    }>({
        user_name: user?.user_name ?? "",
        bio: user?.bio ?? "",
        location: user?.location ?? "",
        profile_picture: null,
        cover_photo: null,
        full_name: user?.full_name ?? ""
    });

    const handleSaveProfile = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        const formData = new FormData();

        // text fields
        formData.append("user_name", editForm.user_name);
        formData.append("full_name", editForm.full_name);
        formData.append("location", editForm.location);
        formData.append("bio", editForm.bio);

        // upload profile picture if a new one is selected
        if (editForm.profile_picture instanceof File) {
            const imageKit = new ImageKitClient({
                publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
                urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
                authenticationEndpoint: "http://localhost:8000/api/imagekit-auth",
            } as MyImageKitOptions);

            const { data: authData } = await axios.get("/api/imagekit-auth");

            const uploadRes = await imageKit.upload({
                file: editForm.profile_picture,
                fileName: `${editForm.user_name}_profile.jpg`,
                folder: "/monolith/user_images",
                signature: authData.signature,
                token: authData.token,
                expire: authData.expire,
            });

            formData.append("profile_picture", uploadRes.url);
        }

        // upload cover photo if a new one is selected
        if (editForm.cover_photo instanceof File) {
            const imageKit = new ImageKitClient({
                publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
                urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
                authenticationEndpoint: "http://localhost:8000/api/imagekit-auth",
            } as MyImageKitOptions);

            const { data: authData } = await axios.get("/api/imagekit-auth");

            const uploadRes = await imageKit.upload({
                file: editForm.cover_photo,
                fileName: `${editForm.user_name}_cover.jpg`,
                folder: "/monolith/user_images",
                signature: authData.signature,
                token: authData.token,
                expire: authData.expire,
            });

            formData.append("cover_photo", uploadRes.url);
        }

        const success = await updateUser(formData);
        if (success) setShowEdit(false);
    };

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50">
            <div className="max-w-2xl sm:py-6 mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        {/* PROFILE PICTURE */}
                        <div className="flex flex-col items-start gap-3">
                            <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700 mb-1">
                                Profile Picture
                                <input
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setEditForm({ ...editForm, profile_picture: e.target.files[0] })
                                        }
                                    }}
                                    type="file"
                                    accept="image/*"
                                    id="profile_picture"
                                    hidden
                                />

                                <div className="group/profile relative">
                                    <Image
                                        src={editForm.profile_picture ?
                                            URL.createObjectURL(editForm.profile_picture) :
                                            user?.profile_picture || assets.avatar_icon}
                                        alt=""
                                        width={100}
                                        height={100}
                                        className="w-24 h-24 rounded-full object-cover mt-2"
                                    />

                                    <div
                                        className="absolute hidden group-hover/profile:flex top-0 left-0 right-0
                                            bottom-0 bg-black/20 rounded-full items-center justify-center"
                                    >
                                        <Pencil className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* COVER PHOTO */}
                        <div className="flex flex-col items-start gap-3">
                            <label htmlFor="cover_photo" className="block text-sm font-medium text-gray-700 mb-1">
                                Cover Photo
                                <input
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setEditForm({ ...editForm, cover_photo: e.target.files[0] })
                                        }
                                    }}
                                    type="file"
                                    accept="image/*"
                                    id="cover_photo"
                                    hidden
                                />
                                <div className="group/hover relative">
                                    <Image
                                        src={editForm.cover_photo ?
                                            URL.createObjectURL(editForm.cover_photo) :
                                            user?.cover_photo || assets.image_placeholder}
                                        alt=""
                                        width={320}
                                        height={160}
                                        className="w-80 h-40 rounded-lg bg-linear-to-r from-indigo-200
                                            via-purple-200 to-pink-200 object-cover mt-2"
                                    />

                                    <div
                                        className="absolute hidden group-hover/hover:flex top-0 left-0 right-0
                                            bottom-0 bg-black/20 rounded-lg items-center justify-center"
                                    >
                                        <Pencil className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                value={editForm.full_name}
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                placeholder="Please enter your full name"

                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                onChange={(e) => setEditForm({ ...editForm, user_name: e.target.value })}
                                value={editForm.user_name}
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                placeholder="Please enter a username"

                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                rows={3}
                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                value={editForm.bio}
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                placeholder="Please enter a short bio"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                value={editForm.location}
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg"
                                placeholder="Please enter your location"

                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-6">
                            <button
                                onClick={() => setShowEdit(false)}
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700
                                    hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-600 text-white
                                    rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProfileModal