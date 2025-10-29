<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Story extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'media_url',
        'media_type',
        'view_count',
        'background_color'
    ];

    protected $casts = [
        'media_url' => 'array',
        'view_count' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
