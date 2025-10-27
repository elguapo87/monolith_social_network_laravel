<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
}
