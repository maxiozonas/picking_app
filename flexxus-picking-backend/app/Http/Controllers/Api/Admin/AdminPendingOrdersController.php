<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListPendingOrdersRequest;
use App\Http\Requests\Admin\RefreshPendingOrdersRequest;
use App\Http\Resources\Admin\PendingOrderResource;
use App\Services\Picking\Interfaces\AdminPickingServiceInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminPendingOrdersController extends Controller
{
    public function __construct(
        private AdminPickingServiceInterface $adminPickingService
    ) {}

    /**
     * Get pending orders from Flexxus.
     */
    public function index(ListPendingOrdersRequest $request): AnonymousResourceCollection
    {
        $orders = $this->adminPickingService->getPendingOrders($request->validated());

        return PendingOrderResource::collection($orders);
    }

    /**
     * Force refresh pending orders from Flexxus (clears cache).
     */
    public function refresh(RefreshPendingOrdersRequest $request): AnonymousResourceCollection
    {
        $orders = $this->adminPickingService->refreshPendingOrders($request->validated());

        return PendingOrderResource::collection($orders);
    }
}
