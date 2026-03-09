<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminOrderDetailResource;
use App\Http\Resources\Admin\AdminOrderResource;
use App\Models\PickingOrderProgress;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminOrdersController extends Controller
{
    /**
     * Get all orders with optional filters.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = PickingOrderProgress::query();

        // Apply filters
        $query->when($request->has('warehouse_id'), function ($q) use ($request) {
            return $q->byWarehouse($request->input('warehouse_id'));
        })
            ->when($request->has('status'), function ($q) use ($request) {
                return $q->withStatus($request->input('status'));
            })
            ->when($request->has('search'), function ($q) use ($request) {
                return $q->searchByNumber($request->input('search'));
            })
            ->dateRange(
                $request->input('date_from'),
                $request->input('date_to')
            );

        // Load relationships
        $query->with(['user', 'warehouse']);

        // Paginate
        $perPage = $request->input('per_page', 15);
        $orders = $query->latest('created_at')->paginate($perPage);

        return AdminOrderResource::collection($orders);
    }

    /**
     * Get order detail with items and alerts.
     */
    public function show(string $orderNumber): AdminOrderDetailResource
    {
        $order = PickingOrderProgress::where('order_number', $orderNumber)
            ->with(['user', 'warehouse', 'items', 'alerts'])
            ->firstOrFail();

        return new AdminOrderDetailResource($order);
    }
}
