<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        $query = User::query();

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
            ->get(['id', 'username', 'full_name', 'email', 'location', 'profile_picture', 'cover_photo', 'bio']);

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
}
