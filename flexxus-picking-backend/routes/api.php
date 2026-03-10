<?php

use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminInventoryController;
use App\Http\Controllers\Api\Admin\AdminOrdersController;
use App\Http\Controllers\Api\Admin\AdminPendingOrdersController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\WarehouseController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PickingController;
use App\Http\Controllers\Api\PickingStockController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/override-warehouse', [AuthController::class, 'overrideWarehouse']);
        Route::post('/clear-override', [AuthController::class, 'clearOverride']);
    });
});

Route::middleware('auth:sanctum', 'role.admin')->prefix('admin')->group(function () {
    // Dashboard statistics
    Route::get('/stats', [AdminDashboardController::class, 'stats']);

    // Admin orders management
    Route::get('/orders', [AdminOrdersController::class, 'index']);
    Route::get('/orders/{order_number}', [AdminOrdersController::class, 'show']);

    // Pending orders (from Flexxus)
    Route::get('/pending-orders', [AdminPendingOrdersController::class, 'index']);
    Route::post('/pending-orders/refresh', [AdminPendingOrdersController::class, 'refresh']);

    // Inventory / Stock
    Route::get('/inventory', [AdminInventoryController::class, 'index']);
    Route::get('/inventory/search', [AdminInventoryController::class, 'search']);

    // User CRUD
    Route::apiResource('users', UserController::class);

    // Warehouse assignment
    Route::post('/users/{user}/warehouses/{warehouse}', [WarehouseController::class, 'assignToUser']);
    Route::delete('/users/{user}/warehouses/{warehouse}', [WarehouseController::class, 'removeFromUser']);
    Route::get('/users/{user}/warehouses', [WarehouseController::class, 'getUserWarehouse']);

    // Warehouses list
    Route::get('/warehouses', [WarehouseController::class, 'index']);
    Route::put('/warehouses/{warehouse}/flexxus-credentials', [WarehouseController::class, 'updateFlexxusCredentials']);
    Route::delete('/warehouses/{warehouse}/flexxus-credentials', [WarehouseController::class, 'clearFlexxusCredentials']);
});

Route::middleware(['auth:sanctum', 'warehouse.override'])->prefix('picking')->group(function () {
    Route::get('/orders', [PickingController::class, 'index']);
    Route::get('/orders/{order_number}', [PickingController::class, 'show']);
    Route::post('/orders/{order_number}/start', [PickingController::class, 'start']);
    Route::post('/orders/{order_number}/items/{product_code}/pick', [PickingController::class, 'pickItem']);
    Route::post('/orders/{order_number}/complete', [PickingController::class, 'complete']);
    Route::post('/orders/{order_number}/alerts', [PickingController::class, 'createAlert']);
    Route::get('/alerts', [PickingController::class, 'alerts']);
    Route::patch('/alerts/{id}/resolve', [PickingController::class, 'resolveAlert']);

    // Stock validation endpoints
    Route::get('/orders/{order_number}/stock/{product_code}', [PickingStockController::class, 'getStockForItem']);
    Route::get('/orders/{order_number}/stock-validations', [PickingStockController::class, 'getValidationStatus']);
});
