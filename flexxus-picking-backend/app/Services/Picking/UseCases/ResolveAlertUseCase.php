<?php

namespace App\Services\Picking\UseCases;

use App\Models\PickingAlert;
use App\Services\Picking\DTO\PickingRequestContext;

final class ResolveAlertUseCase
{
    public function execute(
        int $alertId,
        int $resolverId,
        string $notes,
        PickingRequestContext $requestContext
    ): PickingAlert {
        $alert = PickingAlert::findOrFail($alertId);

        $alert->is_resolved = true;
        $alert->resolved_at = now();
        $alert->resolved_by = $resolverId;
        $alert->resolution_notes = $notes ?: null;
        $alert->save();

        return $alert->load(['warehouse', 'reporter', 'resolver']);
    }
}
