<?php

namespace App\Services\Picking;

/**
 * Pure formatting helper — no I/O, no caching.
 * Transforms raw Flexxus data structures into application-level shapes.
 */
class FlexxusDataFormatter
{
    public function formatOrderForList(array $flexxusOrder): array
    {
        return [
            'order_number' => 'NP '.($flexxusOrder['NUMEROCOMPROBANTE'] ?? ''),
            'customer' => $flexxusOrder['RAZONSOCIAL'] ?? 'Unknown',
            'total' => (float) ($flexxusOrder['TOTAL'] ?? 0),
            'created_at' => $flexxusOrder['FECHACOMPROBANTE'] ?? now()->toIso8601String(),
            'delivery_type' => $flexxusOrder['delivery_type'] ?? 'UNKNOWN',
            'raw_data' => $flexxusOrder,
        ];
    }

    public function formatOrderItem(array $item, ?array $stockInfo): array
    {
        $quantity = (int) ($item['PENDIENTE'] ?? $item['CANTIDAD'] ?? 0);
        $fallbackLocation = isset($stockInfo['warehouse'])
            ? 'Deposito '.$stockInfo['warehouse']
            : null;

        return [
            'product_code' => $item['CODIGOPARTICULAR'] ?? '',
            'description' => $item['DESCRIPCION'] ?? '',
            'quantity_required' => $quantity,
            'lot' => $item['LOTE'] ?? 'SINLOTE',
            'location' => $stockInfo['location'] ?? $fallbackLocation,
            'stock_info' => $stockInfo ? [
                'available' => $stockInfo['total'],
                'is_local' => $stockInfo['is_local'],
                'is_sufficient' => $stockInfo['total'] >= $quantity,
                'shortage' => max(0, $quantity - $stockInfo['total']),
            ] : null,
            'raw_data' => $item,
        ];
    }
}
