<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

    public function getChatMessages(Request $request)
    {
        try {
            $userId = Auth::id();
            $toUserId = $request->input('to_user_id');

            // Validate input
            if (!$toUserId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Recipient user ID is required'
                ], 400);
            }

            // Fetch all messages between both users
            $messages = Message::where(function ($query) use ($userId, $toUserId) {
                $query->where('from_user_id', $userId)
                    ->where('to_user_id', $toUserId);
            })
                ->orWhere(function ($query) use ($userId, $toUserId) {
                    $query->where('from_user_id', $toUserId)
                        ->where('to_user_id', $userId);
                })
                ->orderBy('created_at', 'desc')
                ->with('fromUser:id,full_name,user_name,profile_picture')
                ->with('toUser:id,full_name,user_name,profile_picture')
                ->get();

            // Mark messages from the other user as "seen"
            $updatedCount = Message::where('from_user_id', $toUserId)
                ->where('to_user_id', $userId)
                ->where('seen', false)
                ->update(['seen' => true]);

            // Return messages
            return response()->json([
                'success' => true,
                'messages' => $messages
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getUnreadMessagesBySender(Request $request)
    {
        try {
            $userId = Auth::id();

            $unreadMessages = Message::where('to_user_id', $userId)
                ->where('seen', false)
                ->with('fromUser:id,full_name,user_name,profile_picture')
                ->select(
                    'from_user_id',
                    DB::raw('COUNT(*) as unread_count'),
                    DB::raw('MAX(created_at) as latest_created_at')
                )
                ->groupBy('from_user_id')
                ->orderByDesc('latest_created_at')
                ->get();

                return response()->json([
                    'success' => true,
                    'unread_messages' => $unreadMessages,
                ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserRecentMessages(Request $request)
    {
        try {
            $userId = Auth::id();

            // Get last message (read or unread) per conversation
            $recentConversations = Message::select(
                DB::raw('
                    CASE 
                        WHEN from_user_id = ' . $userId . ' THEN to_user_id 
                        ELSE from_user_id 
                    END as other_user_id
                '),
                DB::raw('MAX(created_at) as latest_created_at')
            )
                ->where(function ($query) use ($userId) {
                    $query->where('from_user_id', $userId)
                        ->orWhere('to_user_id', $userId);
                })
                ->groupBy('other_user_id')
                ->orderByDesc('latest_created_at')
                ->limit(5)
                ->get();

            // Map data: fetch each last message + unread count
            $recentConversations = $recentConversations->map(function ($conv) use ($userId) {
                $latestMessage = Message::where(function ($query) use ($userId, $conv) {
                    $query->where('from_user_id', $userId)
                        ->where('to_user_id', $conv->other_user_id);
                })
                    ->orWhere(function ($query) use ($userId, $conv) {
                        $query->where('from_user_id', $conv->other_user_id)
                            ->where('to_user_id', $userId);
                    })
                    ->orderByDesc('created_at')
                    ->with(['fromUser:id,full_name,user_name,profile_picture'])
                    ->first();

                $unreadCount = Message::where('from_user_id', $conv->other_user_id)
                    ->where('to_user_id', $userId)
                    ->where('seen', false)
                    ->count();

                return [
                    'user' => $latestMessage->from_user_id == $userId
                        ? $latestMessage->toUser
                        : $latestMessage->fromUser,
                    'latest_message' => $latestMessage->text ?? 'Media',
                    'latest_created_at' => $latestMessage->created_at,
                    'unread_count' => $unreadCount,
                ];
            });

            return response()->json([
                'success' => true,
                'recent_messages' => $recentConversations,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
