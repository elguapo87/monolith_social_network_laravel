<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
}
