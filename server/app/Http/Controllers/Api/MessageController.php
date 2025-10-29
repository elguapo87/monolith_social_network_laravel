<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function sendMessage(Request $request)
    {
        try {
            $request->validate([
                'to_user_id' => 'required|exists:users,id',
                'text' => 'nullable|string',
                'media_url' => 'nullable|string'
            ]);

            $fromUser = Auth::user();
            $toUserId = $request->to_user_id;

            // Create message
            $message = Message::create([
                'from_user_id' => $fromUser->id,
                'to_user_id' => $toUserId,
                'text' => $request->text,
                'media_url' => $request->media_url,
                'message_type' => $request->media_url ? 'image' : 'text',
                'seen' => false
            ]);

            return response()->json([
                'success' => true,
                'message' => $message
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
