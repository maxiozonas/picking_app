<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlexxusOrderSnapshot extends Model
{
    protected $fillable = [
        'warehouse_id',
        'snapshot_date',
        'order_number',
        'order_type',
        'customer',
        'total',
        'delivery_type',
        'flexxus_created_at',
        'payload',
        'synced_at',
    ];

    protected $casts = [
        'snapshot_date' => 'date',
        'total' => 'decimal:2',
        'flexxus_created_at' => 'datetime',
        'payload' => 'array',
        'synced_at' => 'datetime',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }
}
