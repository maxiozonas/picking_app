<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ListOrdersRequest;
use App\Http\Resources\Admin\AdminOrderDetailResource;
use App\Http\Resources\Admin\AdminOrderResource;
use App\Models\PickingOrderProgress;
use App\Services\Picking\Interfaces\AdminPickingServiceInterface;
use App\Services\Picking\OrderNumberParser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminOrdersController extends Controller
{
    public function __construct(
        private AdminPickingServiceInterface $adminPickingService
    ) {}

    /**
     * Get all orders with optional filters.
     */
    public function index(ListOrdersRequest $request): AnonymousResourceCollection
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
        $perPage = $request->integer('per_page', 15);
        $orders = $query->latest('created_at')->paginate($perPage);

        return AdminOrderResource::collection($orders);
    }

    /**
     * Get order detail with items and alerts.
     * Tries local DB first; falls back to Flexxus for unstarted orders.
     */
    public function show(string $orderNumber): AdminOrderDetailResource|JsonResponse
    {
        // Normalize to canonical form ("NP 623203") regardless of what the route receives
        $canonical = OrderNumberParser::normalize($orderNumber);

        $order = PickingOrderProgress::where('order_number', $canonical)
            ->with(['user', 'warehouse', 'items', 'alerts.reporter', 'alerts.warehouse', 'events.user'])
            ->first();

        if ($order) {
            return new AdminOrderDetailResource($order);
        }

        // Order not in local DB — it may be an unstarted Flexxus order
        $flexxusDetail = $this->adminPickingService->getPendingOrderDetail($canonical);

        if ($flexxusDetail) {
            return response()->json(['data' => $flexxusDetail]);
        }

        abort(404, "Order {$canonical} not found");
    }
}
