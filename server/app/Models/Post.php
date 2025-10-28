<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'image_urls',
        'post_type'
    ];

    protected $casts = [
        'image_urls' => 'array'  // store image_urls as JSON
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Post likes (users who liked this post)
    public function likes()
    {
        return $this->belongsTo(User::class, 'post_likes');
    }
}
