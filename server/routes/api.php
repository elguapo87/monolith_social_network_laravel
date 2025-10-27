<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use ImageKit\ImageKit;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile-picture', [AuthController::class, 'updateProfilePicture']);
    Route::post('/user/update', [UserController::class, 'updateUser']);
});

Route::get('/imagekit-auth', function (Request $request) {
    $publicKey = config('services.imageKit.public_key');
    $privateKey = config('services.imageKit.private_key');
    $urlEndpoint = config('services.imageKit.url_endpoint');

    $imageKit = new \ImageKit\ImageKit($publicKey, $privateKey, $urlEndpoint);

    $auth = $imageKit->getAuthenticationParameters();

    return response()->json($auth);
});