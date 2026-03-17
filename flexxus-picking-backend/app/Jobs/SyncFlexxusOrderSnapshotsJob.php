<?php

namespace App\Jobs;

use App\Services\Picking\FlexxusOrderSnapshotService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncFlexxusOrderSnapshotsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 180;

    public function __construct(
        public ?string $date = null
    ) {}

    public function handle(FlexxusOrderSnapshotService $snapshotService): void
    {
        $snapshotService->syncActiveWarehouses($this->date);
    }
}
