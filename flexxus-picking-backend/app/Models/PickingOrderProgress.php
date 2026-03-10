<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PickingOrderProgress extends Model
{
    use HasFactory;

    protected $table = 'picking_orders_progress';

    protected $fillable = [
        'order_type',
        'order_number',
        'customer',
        'user_id',
        'warehouse_id',
        'status',
        'started_at',
        'completed_at',
        'has_stock_issues',
        'issues_count',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'has_stock_issues' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PickingItemProgress::class, 'picking_order_progress_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(PickingAlert::class, 'order_number', 'order_number');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeHasIssues($query)
    {
        return $query->where('status', 'has_issues');
    }

    public function scopeByWarehouse($query, int $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }

    public function scopeDateRange($query, ?string $from = null, ?string $to = null)
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        return $query;
    }

    public function scopeSearchByNumber($query, ?string $search = null)
    {
        if ($search) {
            return $query->where('order_number', 'like', "%{$search}%");
        }

        return $query;
    }

    public function scopeWithStatus($query, ?string $status = null)
    {
        if ($status) {
            return $query->where('status', $status);
        }

        return $query;
    }
}
