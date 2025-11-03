"use client"

import { UserContext } from "@/context/UserContext";
import axios from "@/lib/axios";
import { Send } from "lucide-react";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assets } from "../../public/assets";

const PostComments = ({ postId }: { postId: number }) => {

  const context = useContext(UserContext);
  if (!context) throw new Error("PostComments must be within UserContextProvider");
  const { user, commentsByPost, setCommentsByPost, fetchComments, fetchCommentsCount } = context;

  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (showComments) fetchComments(postId);
  }, [showComments]);

  // Get comments from centralized context
  const comments = commentsByPost[postId] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!newComment.trim()) return;
    setIsLoading(true);

    const commentText = newComment;
    setNewComment("");

    try {

      await axios.get("/sanctum/csrf-cookie");

      const { data } = await axios.post(`/api/comments/${postId}/add`, { content: commentText });
      if (data.success) {
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }));
        setNewComment("");
        await fetchComments(postId);
        await fetchCommentsCount(postId);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to add comment");

    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { data } = await axios.delete(`/api/comments/${id}/delete`);
      if (data.success) {
        toast.success(data.message);
        await fetchComments(postId);
        await fetchCommentsCount(postId)
      
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="mt-2">
      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setShowComments(prev => !prev)}
        className="text-xs text-indigo-600 font-medium cursor-pointer"

      >
        {showComments ? "Hide comments" : "Show comments"}
      </button>

      {showComments && (
        <div className="mt-3 border-t border-gray-200 pt-3 space-y-3">
          {/* COMMENT FORM */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isLoading}
              value={newComment}
              type="text"
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-1 text-indigo-600 hover:text-indigo-800"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* COMMENTS LIST */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.length === 0 && (
              <p className="text-gray-400 text-xs text-center">No comments yet.</p>
            )}

            {comments.map((comment) => (
              <div key={comment?.id} className="flex items-center gap-2">
                <Image 
                  src={comment?.user?.profile_picture || assets.avatar_icon}
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 aspect-square rounded-full"
                />
                <div className="bg-gray-100 rounded-lg px-3 py-1.5 text-sm">
                  <span className="font-medium text-gray-800">{comment?.user?.full_name}</span>{" "}
                  <span className="text-gray-700">{comment?.content}</span>
                </div>

                {/* DELETE BUTTON (VISIBLE ON HOVER) */}
                {comment?.user?.id === user?.id && (
                  <button
                    onClick={() => handleDelete(comment?.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 cursor-pointer
                      hover:text-red-500 hover:opacity-100 transition font-semibold"
                  >
                    ✕
                  </button>
                )}
                
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PostComments
