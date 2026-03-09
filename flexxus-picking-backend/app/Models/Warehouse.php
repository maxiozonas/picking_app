<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Warehouse extends Model
{
    use HasFactory;

    protected $hidden = [
        'flexxus_url',
        'flexxus_username',
        'flexxus_password',
    ];

    protected $fillable = [
        'code',
        'name',
        'client',
        'branch',
        'is_active',
        'flexxus_url',
        'flexxus_username',
        'flexxus_password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'flexxus_url' => 'encrypted',
        'flexxus_username' => 'encrypted',
        'flexxus_password' => 'encrypted',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_warehouse')
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get decrypted Flexxus credentials
     *
     * @return array{username: string|null, password: string|null}
     */
    public function getFlexxusCredentials(): array
    {
        return [
            'username' => $this->flexxus_username,
            'password' => $this->flexxus_password,
        ];
    }

    public function hasCompleteFlexxusCredentials(): bool
    {
        return filled($this->flexxus_url)
            && filled($this->flexxus_username)
            && filled($this->flexxus_password);
    }
}
