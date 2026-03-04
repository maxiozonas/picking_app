<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PickingStockValidation extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'item_code',
        'validation_type',
        'requested_qty',
        'available_qty',
        'validation_result',
        'error_code',
        'stock_snapshot',
        'context',
        'validated_at',
        'user_id',
        'warehouse_id',
    ];

    protected $casts = [
        'stock_snapshot' => 'array',
        'context' => 'array',
        'validated_at' => 'datetime',
        'requested_qty' => 'integer',
        'available_qty' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('validation_result', 'passed');
    }

    public function scopeFailed($query)
    {
        return $query->where('validation_result', 'failed');
    }

    public function scopeForOrder($query, string $orderNumber)
    {
        return $query->where('order_number', $orderNumber);
    }

    public function scopeForItem($query, string $itemCode)
    {
        return $query->where('item_code', $itemCode);
    }
}
