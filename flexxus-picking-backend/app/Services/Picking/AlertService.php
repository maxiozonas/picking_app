<?php

namespace App\Services\Picking;

use App\Models\PickingAlert;
use App\Models\User;
use App\Services\Picking\Interfaces\AlertServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Alert Service - Skeleton Implementation
 *
 * NOTE: This is a skeleton implementation. Full implementation will be done in Phase 4.
 *
 * @implements AlertServiceInterface
 */
class AlertService implements AlertServiceInterface
{
    /**
     * {@inheritdoc}
     */
    public function createAlert(array $data, User $reporter): PickingAlert
    {
        // Validate alert_type is allowed
        $allowedTypes = ['insufficient_stock', 'product_missing', 'order_issue'];
        if (! in_array($data['alert_type'], $allowedTypes)) {
            throw new \InvalidArgumentException("Invalid alert_type: {$data['alert_type']}");
        }

        // Validate severity is allowed
        $allowedSeverities = ['low', 'medium', 'high', 'critical'];
        if (! in_array($data['severity'], $allowedSeverities)) {
            throw new \InvalidArgumentException("Invalid severity: {$data['severity']}");
        }

        // warehouse_id is required
        if (! isset($data['warehouse_id'])) {
            throw new \InvalidArgumentException('warehouse_id is required');
        }

        return PickingAlert::create([
            'order_number' => $data['order_number'],
            'warehouse_id' => $data['warehouse_id'],
            'user_id' => $reporter->id,
            'alert_type' => $data['alert_type'],
            'product_code' => $data['product_code'] ?? null,
            'message' => $data['message'],
            'severity' => $data['severity'],
            'is_resolved' => false,
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function resolveAlert(int $alertId, User $resolver, ?string $resolutionNote = null): PickingAlert
    {
        $alert = PickingAlert::findOrFail($alertId);

        $alert->update([
            'is_resolved' => true,
            'resolved_at' => now(),
            'resolved_by' => $resolver->id,
        ]);

        return $alert->fresh();
    }

    /**
     * {@inheritdoc}
     */
    public function getAlertsForOrder(string $orderNumber): array
    {
        return PickingAlert::where('order_number', $orderNumber)
            ->orderBy('created_at', 'desc')
            ->get()
            ->all();
    }

    /**
     * {@inheritdoc}
     */
    public function getPaginatedAlerts(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = PickingAlert::with(['reporter', 'resolver', 'warehouse']);

        // Filter by warehouse
        if (isset($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        // Filter by resolution status
        if (isset($filters['is_resolved'])) {
            $query->where('is_resolved', $filters['is_resolved']);
        }

        // Filter by severity
        if (isset($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        // Filter by alert type
        if (isset($filters['alert_type'])) {
            $query->where('alert_type', $filters['alert_type']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * {@inheritdoc}
     */
    public function getHighPriorityAlerts(int $warehouseId): array
    {
        return PickingAlert::where('warehouse_id', $warehouseId)
            ->whereIn('severity', ['high', 'critical'])
            ->where('is_resolved', false)
            ->orderBy('severity', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->all();
    }

    /**
     * {@inheritdoc}
     */
    public function hasCriticalAlerts(string $orderNumber): bool
    {
        return PickingAlert::where('order_number', $orderNumber)
            ->where('severity', 'critical')
            ->where('is_resolved', false)
            ->exists();
    }

    /**
     * {@inheritdoc}
     */
    public function createValidationAlert(string $orderNumber, string $itemCode, string $reason, array $context, ?int $userId = null): PickingAlert
    {
        // warehouse_id is required in context
        if (! isset($context['warehouse_id'])) {
            throw new \InvalidArgumentException('warehouse_id is required in context for validation alerts');
        }

        // Map validation reason to alert type
        $alertType = match ($reason) {
            'stock_insufficient', 'over_pick_attempt' => 'insufficient_stock',
            default => 'order_issue',
        };

        // Set severity based on reason
        $severity = match ($reason) {
            'stock_insufficient' => 'high',
            'over_pick_attempt' => 'critical',
            default => 'medium',
        };

        // Build descriptive message
        $message = match ($reason) {
            'stock_insufficient' => "Stock insuficiente para producto {$itemCode}",
            'over_pick_attempt' => "Intento de sobre-pick en producto {$itemCode}",
            default => "Alerta de validación para {$itemCode}: {$reason}",
        };

        return PickingAlert::create([
            'order_number' => $orderNumber,
            'warehouse_id' => $context['warehouse_id'],
            'user_id' => $userId, // Can be null for system-generated alerts
            'alert_type' => $alertType,
            'product_code' => $itemCode,
            'message' => $message,
            'severity' => $severity,
            'is_resolved' => false,
        ]);
    }
}
