<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class FlexxusCredentialsSeeder extends Seeder
{
    private array $credentials;

    public function __construct()
    {
        $flexxusUrl = config('flexxus.url');

        $this->credentials = [
            '002' => [
                'username' => 'PREPR',
                'password' => '1234',
                'url' => $flexxusUrl,
            ],
            '001' => [
                'username' => 'PREPDB',
                'password' => '1234',
                'url' => $flexxusUrl,
            ],
            '004' => [
                'username' => 'PREPVM',
                'password' => '1234',
                'url' => $flexxusUrl,
            ],
        ];
    }

    public function run(): void
    {
        foreach ($this->credentials as $warehouseCode => $creds) {
            $warehouse = Warehouse::where('code', $warehouseCode)->first();

            if (! $warehouse) {
                continue;
            }

            if (empty($warehouse->flexxus_username) && empty($warehouse->flexxus_password)) {
                // Use Eloquent model to ensure encrypted cast is applied
                $warehouse->flexxus_username = $creds['username'];
                $warehouse->flexxus_password = $creds['password'];
                $warehouse->flexxus_url = $creds['url'];
                $warehouse->save();
            }
        }
    }
}
