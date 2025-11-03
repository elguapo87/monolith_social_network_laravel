<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\StoryController;
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
    Route::post('/discover-users', [UserController::class, 'discoverUsers']);
    Route::post('/toggle-follow', [UserController::class, 'toggleFollow']);
    Route::post('/connections/toggle', [UserController::class, 'toggleConnectionRequest']);
    Route::get('/connections', [UserController::class, 'getUserConnections']);
    Route::post('/connections/accept', [UserController::class, 'acceptConnectionRequest']);
    Route::post('/connections/decline', [UserController::class, 'declineConnectionRequest']);
    Route::post('/posts', [PostController::class, 'addPost']);
    Route::get('/posts/feed-posts', [PostController::class, 'getFeedPosts']);
    Route::post('/posts/{post}/like', [PostController::class, 'likePost']);
    Route::get('/user/profile', [UserController::class, 'getUserProfile']);
    Route::post('/stories/add', [StoryController::class, 'addUserStory']);
    Route::get('/stories', [StoryController::class, 'getStories']);
    Route::post('/messages/send', [MessageController::class, 'sendMessage']);
    Route::post('/messages/get-messages', [MessageController::class, 'getChatMessages']);
    Route::get('/messages/unread-messages', [MessageController::class, 'getUnreadMessagesBySender']);
    Route::get('/messages/recent-messages', [MessageController::class, 'getUserRecentMessages']);
    Route::get('/users/{id}', [UserController::class, 'getSelectedUser']);
    Route::get('/my-posts', [PostController::class, 'getUserPosts']);    // current user
    Route::get('/users/{id}/posts', [PostController::class, 'getUserPosts']);   // any user
    Route::get('/comments/{post}/comments', [PostController::class, 'getComments']);
    Route::post('/comments/{post}/add', [PostController::class, 'addComment']);
});

Route::get('/imagekit-auth', function (Request $request) {
    $publicKey = config('services.imageKit.public_key');
    $privateKey = config('services.imageKit.private_key');
    $urlEndpoint = config('services.imageKit.url_endpoint');

    $imageKit = new \ImageKit\ImageKit($publicKey, $privateKey, $urlEndpoint);

    $auth = $imageKit->getAuthenticationParameters();

    return response()->json($auth);
});