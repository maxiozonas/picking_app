<?php

use App\Jobs\RefreshStockForActivePickingJob;
use App\Jobs\SyncFlexxusOrderSnapshotsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule stock refresh job for active picking orders every 30 seconds
Schedule::job(new RefreshStockForActivePickingJob)->everyThirtySeconds();

// Keep local order snapshots updated so UIs do not depend on request-time Flexxus calls
Schedule::job(new SyncFlexxusOrderSnapshotsJob)->everyTwoMinutes();
