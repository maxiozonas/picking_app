<?php

namespace App\Jobs;

use App\Models\PickingOrderProgress;
use App\Services\Picking\Interfaces\StockCacheServiceInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RefreshStockForActivePickingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(StockCacheServiceInterface $stockCacheService): void
    {
        // Get all active orders that were updated in the last 2 hours
        $activeOrders = PickingOrderProgress::where('status', 'in_progress')
            ->where('updated_at', '>=', now()->subHours(2))
            ->with(['warehouse', 'user'])
            ->get();

        // Refresh stock cache for each active order
        foreach ($activeOrders as $order) {
            $stockCacheService->prefetchStockForOrder($order);
        }
    }
}
