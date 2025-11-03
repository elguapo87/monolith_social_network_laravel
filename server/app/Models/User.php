<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'user_name',
        'email',
        'password',
        'bio',
        'profile_picture',
        'cover_photo',
        'location',
        'is_verified'
    ];

    // Followers (users who follow this user)
    public function followers()
    {
        return $this->belongsToMany(User::class, 'followers', 'user_id', 'follower_id');
    }

    // Following (users this user follows)
    public function following()
    {
        return $this->belongsToMany(User::class, 'followers', 'follower_id', 'user_id');
    }

    // Connection requests I sent
    public function sentConnections()
    {
        return $this->hasMany(Connection::class, 'from_user_id');
    }

    // Connection requests I received
    public function receivedConnections()
    {
        return $this->hasMany(Connection::class, 'to_user_id');
    }

    // Accepted connections (bidirectional "friends")
    public function friends()
    {
        // Sent & accepted
        $sent = $this->sentConnections()
            ->where('status', 'accepted')
            ->pluck('to_user_id');

        // Received & accepted
        $received = $this->receivedConnections()
            ->where('status', 'accepted')
            ->pluck('from_user_id');
        
        return $sent->merge($received)->unique();
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function stories()
    {
        return $this->hasMany(Story::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    protected $attributes = [
        'bio' => "Hi there! I'm using monolith."
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
