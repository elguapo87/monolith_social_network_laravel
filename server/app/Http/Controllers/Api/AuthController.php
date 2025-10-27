<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'user_name' => 'required|string|max:50|unique:users,user_name',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|confirmed|min:8',
            'profile_picture' => 'nullable|url'
        ],
        ['user_name.unique' => 'This username is already in use. Please pick another one.']);

        $user = User::create([
            'full_name' => $request->full_name,
            'user_name' => $request->user_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'profile_picture' => $request->profile_picture
        ]);

        Auth::login($user);

        return response()->json($user);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.']
            ]);
        }

        $request->session()->regenerate();

        return response()->json(Auth::user());
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfilePicture(Request $request) 
    {
        $request->validate([
            'profile_picture' => 'required|url'
        ]);

        $user = $request->user();
        $user->update([
            'profile_picture' => $request->profile_picture
        ]);

        return response()->json([
            'user' => $user
        ]);
    }
}
