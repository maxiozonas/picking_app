<?php

namespace App\Repositories\Flexxus;

use App\Models\Warehouse;
use Illuminate\Support\Collection;

class WarehouseRepository implements WarehouseRepositoryInterface
{
    public function syncFromFlexxus(array $data): void
    {
        if (empty($data)) {
            return;
        }

        foreach ($data as $item) {
            if (! isset($item['CODIGODEPOSITO'])) {
                continue;
            }

            Warehouse::updateOrCreate(
                ['code' => $item['CODIGODEPOSITO']],
                [
                    'name' => $item['DESCRIPCION'] ?? null,
                    'client' => $item['CLIENTE'] ?? null,
                    'branch' => $item['SUCURSAL'] ?? null,
                    'is_active' => (bool) ($item['DEPOSITOVISIBLE'] ?? true),
                ]
            );
        }
    }

    public function getActive(): Collection
    {
        return Warehouse::active()->get();
    }

    public function findByCode(string $code): ?Warehouse
    {
        return Warehouse::where('code', $code)->first();
    }

    public function all(): Collection
    {
        return Warehouse::all();
    }
}
