<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function addPost(Request $request)
    {
        $request->validate([
            'content' => 'nullable|string',
            'post_type' => 'required|in:text,image,text_with_image',
            'image_urls' => 'nullable|array',
            'image_urls.*' => 'url'
        ]);

        $post = Post::create([
            'user_id' => Auth::id(),
            'content' => $request->content,
            'post_type' => $request->post_type,
            'image_urls' => $request->image_urls
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully',
            'post' => $post
        ]);
    }

    public function getFeedPosts(Request $request)
    {
        $user = Auth::user();

        // Collect user IDs: self + following + friends
        $userIds = collect([$user->id])
            ->merge($user->following()->pluck('users.id'))
            ->merge($user->friends()->pluck('id'))
            ->unique();

        // Fetch posts
        $posts = Post::whereIn('user_id', $userIds)
            ->with([
                'author:id,full_name,user_name,profile_picture',
                'likes:id'
            ])
            ->withCount('likes')  // adds likes_count
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform response a bit to match your frontend needs
        $posts->transform(function ($post) use ($user) {
            return [
                'id'            => $post->id,
                'content'       => $post->content,
                'image_urls'    => $post->image_urls,
                'post_type'     => $post->post_type,
                'created_at'    => $post->created_at,
                'author'        => $post->author,
                'likes_count'   => $post->likes_count,
                'likes'         => $post->likes->pluck('id'), // array of user IDs
                'liked_by_me'   => $post->likes->contains($user->id),
            ];
        });

        return response()->json([
            'success' => true,
            'posts'   => $posts,
        ]);
    }

    public function likePost(Post $post)
    {
        $userId = Auth::id();

        // Toggle like/unlike
        $post->likes()->toggle($userId);

        // Check if the user currently likes the post
        $isLiked = $post->likes()->where('user_id', $userId)->exists();

        // Always return accurate count
        $likesCount = $post->likes()->count();

        return response()->json([
            'success' => true,
            'message' => $isLiked ? 'Post liked' : 'Post unliked',
            'isLiked' => $isLiked,
            'likes_count' => $likesCount
        ]);
    }

    public function getUserPosts($id = null)
    {
        $authUser = Auth::user();
        $userId = $id ?? $authUser->id;  // if no id passed, show logged in user's posts

        $posts = Post::where('user_id', $userId)
            ->with([
                'author:id,full_name,user_name,profile_picture',
                'likes:id'     // you can check if current user liked it
            ])
            ->withCount('likes')
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform response for frontend needs
        $posts->transform(function ($post) use ($authUser) {
            return [
                'id'            => $post->id,
                'content'       => $post->content,
                'image_urls'    => $post->image_urls,
                'post_type'     => $post->post_type,
                'created_at'    => $post->created_at,
                'author'        => $post->author,
                'likes_count'   => $post->likes_count,
                'likes'         => $post->likes->pluck('id'),
                'liked_by_me'   => $post->likes->contains($authUser->id),
            ];
        });

        return response()->json([
            'success' => true,
            'posts'   => $posts,
        ]);
    }

    public function getComments($postId)
    {
        $comments = Comment::where('post_id', $postId)  
            ->with('user:id,full_name,user_name,profile_picture')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'comments' => $comments
        ]);
    }

    public function addComment(Request $request, $postId)
    {
        $request->validate(['content' => 'required|string|max:500']);

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $postId,
            'content' => $request->content
        ]);

        return response()->json([
            'success' => true,
            'comment' => $comment
        ]);
    }

    public function count($postId)
    {
        $count = Comment::where('post_id', $postId)->count();
        return response()->json(['success' => true, 'count' => $count]);
    }

    public function deleteComment($id)
    {
        try {
            $comment = Comment::findOrFail($id);

            // Only the comment's author or the post owner can delete
            if (auth()->id() !== $comment->user_id && auth()->id() !== $comment->post->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this comment.'
                ], 403);
            }

            $comment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Comment deleted successfully.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
