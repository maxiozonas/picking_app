<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PickingAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'warehouse_id',
        'user_id',
        'alert_type',
        'product_code',
        'message',
        'severity',
        'is_resolved',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'is_resolved' => 'boolean',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function scopeUnresolved($query)
    {
        return $query->where('is_resolved', false);
    }

    public function scopeHighSeverity($query)
    {
        return $query->where('severity', 'high');
    }
}
