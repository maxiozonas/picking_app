<?php

namespace App\Services\Picking\UseCases;

use App\Models\PickingAlert;
use Illuminate\Pagination\LengthAwarePaginator;

final class GetAlertsUseCase
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = PickingAlert::with(['warehouse', 'reporter']);

        if (isset($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (isset($filters['status'])) {
            $isResolved = $filters['status'] === 'resolved';
            $query->where('is_resolved', $isResolved);
        }

        if (isset($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        if (isset($filters['alert_type'])) {
            $query->where('alert_type', $filters['alert_type']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
