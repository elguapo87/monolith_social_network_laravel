<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\DeleteStoryJob;
use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StoryController extends Controller
{
    public function addUserStory(Request $request)
    {
        $userId = Auth::id();

        $request->validate([
            'content' => 'nullable|string',
            'media_type' => 'required|in:text,image,video',
            'background_color' => 'nullable|string',
            'media' => 'string|url|nullable'
        ]);

        $story = Story::create([
            'user_id' => $userId,
            'content' => $request->content,
            'media_type' => $request->media_type,
            'background_color' => $request->background_color,
            'media_url' => $request->media
        ]);

        // Schedule job to delete after 24 hours
        DeleteStoryJob::dispatch($story->id)->delay(now()->addHours(24));

        return response()->json([
            'success' => true,
            'message' => 'Story added successfully',
            'story' => $story
        ]);
    }

}
