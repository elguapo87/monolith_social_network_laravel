"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { assets, dummyPostsData, dummyUserData } from "../../../../../public/assets";
import Loading from "@/components/Loading";
import Image from "next/image";
import UserProfileInfo from "@/components/UserProfileInfo";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import moment from "moment";
import ProfileModal from "@/components/ProfileModal";

type UserData = typeof dummyUserData;
type PostsData = typeof dummyPostsData;

const Proflie = () => {

  const { profileId } = useParams() as { profileId: string | number };
  
  const [user, setUser] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<PostsData>([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  
  const fetchUser = async () => {
    setUser(dummyUserData);
    setPosts(dummyPostsData);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return user ? (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          {/* COVER PHOTO */}
          <div className="relative h-40 md:h-56 bg-linear-to-r from-indigo-200 via-purple-200 to-pink-200">
            <Image src={user.cover_photo || assets.image_placeholder} fill alt="Cover Photo" className="w-full h-full object-cover" />
          </div>

          {/* USER INFO */}
          <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit} />
        </div>

        {/* TABS */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">
            {["posts", "media", "likes"].map((tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                key={tab} 
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer
                  ${activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* POSTS */}
        {
          activeTab === "posts"
            &&
          (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )
        }

        {/* MEDIA */}
        {
          activeTab === "media"
            &&
          <div className="flex flex-wrap mt-6 max-w-6xl">
            {posts.filter((post) => post.image_urls.length > 0).map((post) => (
              <div key={post._id}>
                {post.image_urls.map((image, index) => (
                  <Link href={image} key={index} target="_blank" className="relative group">
                    <Image src={image} alt="" width={500} height={500} className="w-64 aspect-video object-cover" />
                    <p 
                      className="absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white 
                        opacity-0 group-hover:opacity-100 transition duration-300"
                    >
                      Posted {moment(post.createdAt).fromNow()}
                    </p>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        }
      </div>
      
      {/* EFIT PROFILE MODAL */}
      {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
    </div>
  ) : (
    <Loading />
  )
}

export default Proflie