<?php

namespace App\Jobs;

use App\Models\Story;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DeleteStoryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $storyId;

    /**
     * Create a new job instance.
     */
    public function __construct($storyId)
    {
        $this->storyId = $storyId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Story::where('id', $this->storyId)->delete();
    }
}
