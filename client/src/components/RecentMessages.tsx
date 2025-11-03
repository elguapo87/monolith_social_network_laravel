import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { assets } from "../../public/assets";

type RecentMessageType = {
  latest_created_at: Date;
  latest_message: string;
  unread_count: number
  user: {
    bio: string;
    email: string;
    full_name: string;
    id: number;
    profile_picture: string | null;
    user_name: string;
  };
};

const RecentMessages = () => {

  const [recentMessages, setRecentMessages] = useState<RecentMessageType[]>([]);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const { data } = await axios.get("/api/messages/recent-messages");
        if (data.success) {
          setRecentMessages(data.recent_messages);
        }

      } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(error);
        toast.error(errMessage || "Failed to fetch recent messages");
      }
    };

    fetchRecentMessages();
  }, []);

  return (
    <div className="bg-white  mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>

      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {recentMessages.map((msg) => (
          <Link
            key={msg.user.id}
            href={`/auth/chatBox/${msg.user.id}`}
            className="flex items-start gap-2 py-2 hover:bg-slate-100"
          >
            <Image 
              src={msg.user.profile_picture || assets.avatar_icon} 
              width={32} 
              height={32} 
              alt="" 
              className="size-8 aspect-square rounded-full" 
            />

            <div className="w-full">
              <div className={`flex items-center justify-between ${msg.unread_count === 0 ? "gap-3" : "gap-2"}`}>
                <p className="font-medium">{msg.user.full_name}</p>
                <p className="text-[10px] text-slate-400">
                  {moment(msg.latest_created_at).local().fromNow()}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                 <p className="text-gray-500">{msg.latest_message.slice(0, 20)}</p>
                
                {msg.unread_count > 0 && (
                  <p 
                    className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center
                      rounded-full text-[10px]"
                  >
                    {msg.unread_count}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentMessages