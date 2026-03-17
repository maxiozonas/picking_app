<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlexxusSyncState extends Model
{
    protected $fillable = [
        'warehouse_id',
        'snapshot_date',
        'status',
        'last_attempt_at',
        'last_success_at',
        'last_error',
    ];

    protected $casts = [
        'snapshot_date' => 'date',
        'last_attempt_at' => 'datetime',
        'last_success_at' => 'datetime',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }
}
