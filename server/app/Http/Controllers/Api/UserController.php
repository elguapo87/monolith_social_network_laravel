<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendConnectionRequestEmail;
use App\Models\Connection;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function updateUser(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $request->validate([
            'user_name' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('users', 'user_name')->ignore($user->id)
            ],
            'full_name' => 'sometimes|string|max:255',
            'bio' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|url',
            'cover_photo' => 'nullable|url'
        ], [
            'user_name.unique' => 'This username is already in use. Please choose another one.'
        ]);

        $user->fill($request->only([
            'user_name',
            'full_name',
            'bio',
            'location',
            'profile_picture',
            'cover_photo'
        ]));

        $user->save();

        // Reload with relationships
        $user->load(['followers', 'following']);

        return response()->json([
            'success' => true,
            'user' => $user,
            'message' => 'Profile updated successfully'
        ]);
    }

    public function discoverUsers(Request $request)
    {
        $request->validate([
            'input' => 'nullable|string|max:255'
        ]);

        $input = $request->input('input', '');
        $currentUserId = Auth::id();

        $query = User::query()
            ->withCount('followers');

        if (!empty($input)) {
            $query->where(function ($q) use ($input) {
                $q->where('user_name', 'LIKE', "%{$input}%")
                    ->orWhere('email', 'LIKE', "%{$input}%")
                    ->orWhere('full_name', 'LIKE', "%{$input}%")
                    ->orWhere('location', 'LIKE', "%{$input}%");
            });
        }

        // Exclude the current user
        $users = $query->where('id', '!=', $currentUserId)
            ->limit(20) // 🔹 optional: avoid returning too many
            ->get(['id', 'user_name', 'full_name', 'email', 'location', 'profile_picture', 'cover_photo', 'bio']);

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    public function toggleFollow(Request $request)
    {
        $authUser = Auth::user();
        $toFollowId = $request->input('id');

        // Ensure the target user exists
        $toFollow = User::find($toFollowId);
        if (!$toFollow) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        // Prevent following yourself
        if ($authUser->id == $toFollowId) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot follow yourself.'
            ], 400);
        }

        // Use method for query check
        if ($authUser->following()->where('user_id', $toFollowId)->exists()) {
            if (!$authUser->following()->where('user_id', $toFollowId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not following this user.'
                ]);
            }

            $authUser->following()->detach($toFollowId);

            return response()->json([
                'success' => true,
                'message' => 'You unfollowed this user.'
            ]);

        } else {
            // Use method for attach
            $authUser->following()->attach($toFollowId);

            // Use property when you want actual collection of following users
            $followingUsers = $authUser->following; // returns Collection<User>

            return response()->json([
                'success' => true,
                'message' => 'Now you are following this user.',
                'following_count' => $followingUsers->count(),
            ]);
        }
    }

    public function toggleConnectionRequest(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:users,id',
        ]);

        $authUser = Auth::user();
        $targetId = $request->id;

        if ($authUser->id === $targetId) {
            return response()->json([
                'success' => false,
                'message' => "You can't connect with yourself."
            ], 400);
        }

        $connection = Connection::where(function ($q) use ($authUser, $targetId) {
            $q->where('from_user_id', $authUser->id)
                ->where('to_user_id', $targetId);
        })->orWhere(function ($q) use ($authUser, $targetId) {
            $q->where('from_user_id', $targetId)
                ->where('to_user_id', $authUser->id);
        })->first();

        // If no connection exists → create new (pending)
        if (!$connection) {
            Connection::create([
                'from_user_id' => $authUser->id,
                'to_user_id' => $targetId,
                'status' => 'pending'
            ]);

            $targetUser = User::select('id', 'full_name', 'user_name', 'profile_picture')->find($targetId);

            // Dispatch the email job
            dispatch(new SendConnectionRequestEmail(Auth::user(), User::find($targetId)));

            return response()->json([
                'success' => true,
                'action' => 'sent',
                'message' => 'Connection request sent.', // include the user data
                'target_user' => $targetUser
            ]);
        }

        // If pending & I am the sender → cancel
        if ($connection->status === 'pending' && $connection->from_user_id === $authUser->id) {
            $connection->delete();

            return response()->json([
                'success' => true,
                'action' => 'cancelled',
                'message' => 'Connection request cancelled.'
            ]);
        }

        // If already accepted
        if ($connection->status === 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'You are already connected.',
            ]);
        }

        // If I received a request (and not accepted yet)
        if ($connection->status === 'pending' && $connection->to_user_id === $authUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending connection request from this user.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid state.',
        ]);
    }

    public function getUserConnections(Request $request)
    {
        try {
            $userId = Auth::id();
            $user = User::findOrFail($userId);

            // Accepted (mutual) connections
            $accepted = Connection::where(function ($q) use ($userId) {
                $q->where('from_user_id', $userId)
                    ->orWhere('to_user_id', $userId);
            })
                ->where('status', 'accepted')
                ->with([
                    'fromUser:id,full_name,user_name,profile_picture,bio',
                    'toUser:id,full_name,user_name,profile_picture,bio'
                ])
                ->get()
                ->map(function ($conn) use ($userId) {
                    return $conn->from_user_id === $userId ? $conn->toUser : $conn->fromUser;
                });

            // Pending requests (people I sent requests to)
            $pendingSent = Connection::where('from_user_id', $userId)
                ->where('status', 'pending')
                ->with('toUser:id,full_name,user_name,profile_picture,bio')
                ->get()
                ->pluck('toUser');

            // Pending requests I received (people who sent requests to me)
            $pendingReceived = Connection::where('to_user_id', $userId)
                ->where('status', 'pending')
                ->with('fromUser:id,full_name,user_name,profile_picture,bio')
                ->get()
                ->pluck('fromUser');

            // Followers and following
            $followers = $user->followers()
                ->select('users.id', 'users.full_name', 'users.user_name', 'users.profile_picture', 'users.bio')
                ->get();
            $following = $user->following()
                ->select('users.id', 'users.full_name', 'users.user_name', 'users.profile_picture', 'users.bio')
                ->get();

            return response()->json([
                'success' => true,
                'connections' => $accepted,
                'followers' => $followers,
                'following' => $following,
                'pendingConnections' => $pendingSent,
                'incomingConnections' => $pendingReceived       
            ]);
                
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function acceptConnectionRequest(Request $request) 
    {
        try {
            $userId = Auth::id(); // current authenticated user
            $fromUserId = $request->input('id'); // user who sent the request

            // Find the connection request
            $connection = Connection::where('from_user_id', $fromUserId)
                ->where('to_user_id', $userId)
                ->where('status', 'pending')
                ->first();

            if (!$connection) {
                return response()->json([
                    'success' => false,
                    'message' => 'Connection not found'
                ], 404);
            }

            // Mark as accepted
            $connection->status = 'accepted';
            $connection->save();

            // Add each user to the other's connections pivot
            $fromUser = User::select('id', 'full_name', 'username', 'profile_picture', 'bio')
                ->findOrFail($fromUserId);

            return response()->json([
                'success' => true,
                'message' => 'Connection accepted.',
                'connection' => $fromUser, // return sender info for UI update
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function declineConnectionRequest(Request $request) 
    {
        try {
            $userId = Auth::id();
            $fromUserId = $request->input('id'); // the user who sent the request

            // Find pending connection (someone sent me a request)
            $connection = Connection::where('from_user_id', $fromUserId)
                ->where('to_user_id', $userId)
                ->where('status', 'pending')
                ->first();
            
            if (!$connection) {
                return response()->json([
                    'success' => false,
                    'message' => 'Connection request not found or already handled.'
                ], 404);
            }

            // Delete the request
            $connection->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Connection request rejected',
                'declined_user_id' => $fromUserId, 
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function getUserProfile(Request $request)
    {
        $profileId = $request->input('profile_id');  // from request body
        $profile = User::find($profileId);

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profile not found'
            ], 404);
        }

        // get posts of this user (with author relation)
        $posts = Post::with('author')
            ->where('user_id', $profileId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'profile' => $profile,
            'posts' => $posts
        ]);
    }

    public function getSelectedUser($id)
    {
        $user = User::with(['followers', 'following'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }
}
