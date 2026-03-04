<?php

use App\Jobs\RefreshStockForActivePickingJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule stock refresh job for active picking orders every 30 seconds
Schedule::job(new RefreshStockForActivePickingJob)->everyThirtySeconds();
