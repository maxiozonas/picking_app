<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class WarehouseOverrideMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $overrideWarehouseId = $this->extractOverrideWarehouseId($request);

        if ($overrideWarehouseId !== null) {
            $request->attributes->set('override_warehouse_id', $overrideWarehouseId);
        }

        return $next($request);
    }

    private function extractOverrideWarehouseId(Request $request): ?int
    {
        $headerValue = $request->header('X-Warehouse-Override');
        $queryParam = $request->query('override_warehouse_id');

        $overrideValue = $headerValue ?? $queryParam;

        if ($overrideValue === null) {
            return null;
        }

        $warehouseId = filter_var($overrideValue, FILTER_VALIDATE_INT);

        return $warehouseId !== false ? $warehouseId : null;
    }
}
