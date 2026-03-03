<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PickingItemProgress extends Model
{
    use HasFactory;

    protected $table = 'picking_items_progress';

    protected $fillable = [
        'order_number',
        'product_code',
        'quantity_required',
        'quantity_picked',
        'status',
        'issue_type',
        'issue_notes',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(PickingOrderProgress::class, 'order_number', 'order_number');
    }

    public function getQuantityRemainingAttribute(): int
    {
        return $this->quantity_required - $this->quantity_picked;
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->quantity_picked >= $this->quantity_required;
    }
}
