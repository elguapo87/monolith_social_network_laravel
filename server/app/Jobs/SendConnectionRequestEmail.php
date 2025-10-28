<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendConnectionRequestEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $fromUser;
    protected $toUser;

    /**
     * Create a new job instance.
     */
    public function __construct(User $fromUser, User $toUser)
    {
        $this->fromUser = $fromUser;
        $this->toUser = $toUser;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $fromName = $this->fromUser->full_name;
        $fromUserName = $this->fromUser->user_name;
        $toEmail = $this->toUser->email;

        $frontendUrl = config('app.frontend_url'); // pulls from FRONTEND_URL in .env

        $messageText = "You have a new connection request from {$fromName} - @{$fromUserName}\n\n";
        $messageText .= "Click here to accept or reject the request: {$frontendUrl}/connections";

        Mail::raw($messageText, function ($message) use ($toEmail) {
            $message->to($toEmail)
                ->subject("New Connection Request");
        });
    }
}
