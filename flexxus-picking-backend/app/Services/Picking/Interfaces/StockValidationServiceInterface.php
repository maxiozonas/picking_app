<?php

namespace App\Services\Picking\Interfaces;

use App\Models\PickingOrderProgress;
use App\Models\PickingStockValidation;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Stock Validation Service Interface
 *
 * Defines contract for real-time stock validation during picking operations.
 * Validates against both local order state and Flexxus physical stock.
 */
interface StockValidationServiceInterface
{
    /**
     * Validate stock availability for an item before picking
     *
     * @param  string  $orderNumber  Order number
     * @param  string  $itemCode  Item SKU/code
     * @param  int  $requestedQty  Quantity user wants to pick
     * @param  User  $user  User performing the action
     * @return PickingStockValidation Validation record with result
     *
     * @throws \App\Exceptions\Picking\AlreadyPickedException If item already fully picked
     * @throws \App\Exceptions\Picking\OverPickException If quantity exceeds order requirement
     * @throws \App\Exceptions\Picking\PhysicalStockInsufficientException If Flexxus stock insufficient
     */
    public function validateStockForPick(string $orderNumber, string $itemCode, int $requestedQty, User $user): PickingStockValidation;

    /**
     * Pre-fetch and cache stock for all items in an order
     *
     * @param  PickingOrderProgress  $order  Order to cache stock for
     * @return Collection<PickingStockValidation> Validation records for all items
     */
    public function prefetchStockForOrder(PickingOrderProgress $order): Collection;

    /**
     * Get current validation status for an order item
     *
     * @param  string  $orderNumber  Order number
     * @param  string  $itemCode  Item code
     * @return PickingStockValidation|null Latest validation record or null
     */
    public function getLatestValidation(string $orderNumber, string $itemCode): ?PickingStockValidation;

    /**
     * Check if validation is still valid (not expired)
     *
     * @param  PickingStockValidation  $validation  Validation record
     * @return bool True if valid, false if expired
     */
    public function isValidationValid(PickingStockValidation $validation): bool;

    /**
     * Get all validations for an order
     *
     * @param  string  $orderNumber  Order number
     * @return Collection<PickingStockValidation> All validation records for the order
     */
    public function getOrderValidations(string $orderNumber): Collection;
}
