# Flexxus Warehouse Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sincronizar depósitos desde Flexxus y permitir asignar depósitos a usuarios via API.

**Architecture:** 
- FlexxusClient para comunicación HTTP con la API de Flexxus (auth, token refresh)
- WarehouseRepository para persistencia de depósitos en DB local
- WarehouseService para lógica de negocio
- Comando artisan para sincronización manual

**Tech Stack:** Laravel 12, PHP 8.2+, Sanctum, HTTP Client

---

## Prerequisites

1. Agregar variables al `.env`:
```
FLEXXUS_URL=https://pruebagiliycia.procomisp.com.ar
FLEXXUS_USERNAME=CARLOSR
FLEXXUS_PASSWORD=W250
FLEXXUS_DEVICE_INFO={"model":"0","platform":"0","uuid":"4953457348957348975","version":"0","manufacturer":"0"}
```

---

## Task 1: Configuración inicial

**Files:**
- Modify: `flexxus-picking-backend/.env`
- Create: `flexxus-picking-backend/config/flexxus.php`

**Step 1: Agregar variables al .env**

```bash
# En flexxus-picking-backend/.env agregar:
FLEXXUS_URL=https://pruebagiliycia.procomisp.com.ar
FLEXXUS_USERNAME=CARLOSR
FLEXXUS_PASSWORD=W250
FLEXXUS_DEVICE_INFO={"model":"0","platform":"0","uuid":"4953457348957348975","version":"0","manufacturer":"0"}
```

**Step 2: Crear config/flexxus.php**

```php
<?php

return [
    'url' => env('FLEXXUS_URL'),
    'username' => env('FLEXXUS_USERNAME'),
    'password' => env('FLEXXUS_PASSWORD'),
    'device_info' => json_decode(env('FLEXXUS_DEVICE_INFO', '{}'), true),
];
```

---

## Task 2: FlexxusClient - Cliente HTTP

**Files:**
- Create: `flexxus-picking-backend/app/Http/Clients/Flexxus/FlexxusClient.php`
- Create: `flexxus-picking-backend/app/Http/Clients/Flexxus/FlexxusClientInterface.php`

**Step 1: Escribir test**

```bash
# Crear flexxus-picking-backend/tests/Unit/Clients/FlexxusClientTest.php
```

```php
<?php

namespace Tests\Unit\Clients;

use App\Http\Clients\Flexxus\FlexxusClient;
use Tests\TestCase;
use Illuminate\Support\Facades\Http;

class FlexxusClientTest extends TestCase
{
    public function test_client_can_authenticate(): void
    {
        Http::fake([
            '*' => Http::response([
                'token' => 'test-token-123',
                'expireIn' => 3600,
                'refreshToken' => 'refresh-123',
                'refreshExpireIn' => 86400,
            ], 200),
        ]);

        $client = new FlexxusClient();
        $result = $client->authenticate();

        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('refreshToken', $result);
    }

    public function test_client_can_fetch_warehouses(): void
    {
        Http::fake([
            '*' => Http::response([
                'data' => [
                    ['CODIGODEPOSITO' => '001', 'DESCRIPCION' => 'DON BOSCO', 'CLIENTE' => 'CLIENTE 1', 'SUCURSAL' => 'SUCURSAL 1'],
                ]
            ], 200),
        ]);

        $client = new FlexxusClient();
        $result = $client->getWarehouses();

        $this->assertCount(1, $result);
        $this->assertEquals('001', $result[0]['CODIGODEPOSITO']);
    }
}
```

**Step 2: Run test to verify it fails**

```bash
cd flexxus-picking-backend && php artisan test --filter=FlexxusClientTest
```

Expected: FAIL - Class not found

**Step 3: Implementar FlexxusClientInterface**

```php
<?php

namespace App\Http\Clients\Flexxus;

interface FlexxusClientInterface
{
    public function authenticate(): array;
    public function getWarehouses(): array;
    public function request(string $method, string $endpoint, array $data = []): array;
}
```

**Step 4: Implementar FlexxusClient**

```php
<?php

namespace App\Http\Clients\Flexxus;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class FlexxusClient implements FlexxusClientInterface
{
    private string $baseUrl;
    private string $username;
    private string $password;
    private array $deviceInfo;
    private ?string $token = null;
    private ?string $refreshToken = null;

    public function __construct()
    {
        $this->baseUrl = config('flexxus.url');
        $this->username = config('flexxus.username');
        $this->password = config('flexxus.password');
        $this->deviceInfo = config('flexxus.device_info');
    }

    public function authenticate(): array
    {
        $response = Http::timeout(30)->post("{$this->baseUrl}/auth/login", [
            'username' => $this->username,
            'password' => $this->password,
            'deviceinfo' => $this->deviceInfo,
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Flexxus authentication failed: ' . $response->body());
        }

        $data = $response->json();
        
        $this->token = $data['token'] ?? null;
        $this->refreshToken = $data['refreshToken'] ?? null;

        Cache::put('flexxus_token', $this->token, now()->addSeconds($data['expireIn'] ?? 3600));
        Cache::put('flexxus_refresh_token', $this->refreshToken, now()->addSeconds($data['refreshExpireIn'] ?? 86400));

        return $data;
    }

    public function getWarehouses(): array
    {
        $token = Cache::get('flexxus_token');

        if (!$token) {
            $this->authenticate();
            $token = Cache::get('flexxus_token');
        }

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->timeout(30)->get("{$this->baseUrl}/v2/warehouses");

        if ($response->status() === 401) {
            $this->authenticate();
            $token = Cache::get('flexxus_token');
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$token}",
            ])->timeout(30)->get("{$this->baseUrl}/v2/warehouses");
        }

        if (!$response->successful()) {
            throw new \RuntimeException('Failed to fetch warehouses: ' . $response->body());
        }

        return $response->json('data') ?? [];
    }

    public function request(string $method, string $endpoint, array $data = []): array
    {
        $token = Cache::get('flexxus_token');

        if (!$token) {
            $this->authenticate();
            $token = Cache::get('flexxus_token');
        }

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->timeout(30)->{$method}("{$this->baseUrl}{$endpoint}", $data);

        if ($response->status() === 401) {
            $this->authenticate();
            $token = Cache::get('flexxus_token');
            
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$token}",
            ])->timeout(30)->{$method}("{$this->baseUrl}{$endpoint}", $data);
        }

        if (!$response->successful()) {
            throw new \RuntimeException("Request to {$endpoint} failed: " . $response->body());
        }

        return $response->json();
    }
}
```

**Step 5: Run test to verify it passes**

```bash
cd flexxus-picking-backend && php artisan test --filter=FlexxusClientTest
```

Expected: PASS

**Step 6: Commit**

```bash
cd flexxus-picking-backend
git add .env config/flexxus.php app/Http/Clients/
git commit -m "feat: add FlexxusClient for API communication"
```

---

## Task 3: WarehouseRepository - Persistencia

**Files:**
- Create: `flexxus-picking-backend/app/Repositories/Flexxus/WarehouseRepository.php`
- Create: `flexxus-picking-backend/app/Repositories/Flexxus/WarehouseRepositoryInterface.php`

**Step 1: Escribir test**

```bash
# Crear flexxus-picking-backend/tests/Unit/Repositories/WarehouseRepositoryTest.php
```

```php
<?php

namespace Tests\Unit\Repositories;

use App\Models\Warehouse;
use App\Repositories\Flexxus\WarehouseRepository;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WarehouseRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private WarehouseRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new WarehouseRepository();
    }

    public function test_can_sync_warehouses_from_flexxus(): void
    {
        $flexxusData = [
            ['CODIGODEPOSITO' => '001', 'DESCRIPCION' => 'DON BOSCO', 'CLIENTE' => 'CLIENTE 1', 'SUCURSAL' => 'SUCURSAL 1', 'DEPOSITOVISIBLE' => 1],
            ['CODIGODEPOSITO' => '002', 'DESCRIPCION' => 'RONDEAU', 'CLIENTE' => 'CLIENTE 2', 'SUCURSAL' => 'SUCURSAL 2', 'DEPOSITOVISIBLE' => 1],
        ];

        $this->repository->syncFromFlexxus($flexxusData);

        $this->assertDatabaseCount('warehouses', 2);
        $this->assertDatabaseHas('warehouses', ['code' => '001', 'name' => 'DON BOSCO']);
    }

    public function test_can_get_active_warehouses(): void
    {
        Warehouse::factory()->create(['code' => '001', 'name' => 'Test', 'is_active' => true]);
        Warehouse::factory()->create(['code' => '002', 'name' => 'Test 2', 'is_active' => false]);

        $warehouses = $this->repository->getActive();

        $this->assertCount(1, $warehouses);
    }

    public function test_can_find_warehouse_by_code(): void
    {
        Warehouse::factory()->create(['code' => '001', 'name' => 'Test']);

        $warehouse = $this->repository->findByCode('001');

        $this->assertNotNull($warehouse);
        $this->assertEquals('001', $warehouse->code);
    }
}
```

**Step 2: Run test to verify it fails**

```bash
cd flexxus-picking-backend && php artisan test --filter=WarehouseRepositoryTest
```

Expected: FAIL

**Step 3: Implementar WarehouseRepositoryInterface**

```php
<?php

namespace App\Repositories\Flexxus;

use App\Models\Warehouse;
use Illuminate\Support\Collection;

interface WarehouseRepositoryInterface
{
    public function syncFromFlexxus(array $data): void;
    public function getActive(): Collection;
    public function findByCode(string $code): ?Warehouse;
    public function all(): Collection;
}
```

**Step 4: Implementar WarehouseRepository**

```php
<?php

namespace App\Repositories\Flexxus;

use App\Models\Warehouse;
use Illuminate\Support\Collection;

class WarehouseRepository implements WarehouseRepositoryInterface
{
    public function syncFromFlexxus(array $data): void
    {
        foreach ($data as $item) {
            Warehouse::updateOrCreate(
                ['code' => $item['CODIGODEPOSITO']],
                [
                    'name' => $item['DESCRIPCION'],
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
```

**Step 5: Run test to verify it passes**

```bash
cd flexxus-picking-backend && php artisan test --filter=WarehouseRepositoryTest
```

Expected: PASS

**Step 6: Commit**

```bash
cd flexxus-picking-backend
git add app/Repositories/
git commit -m "feat: add WarehouseRepository for persistence"
```

---

## Task 4: WarehouseService - Lógica de negocio

**Files:**
- Create: `flexxus-picking-backend/app/Services/Flexxus/WarehouseService.php`
- Create: `flexxus-picking-backend/app/Services/Flexxus/WarehouseServiceInterface.php`

**Step 1: Escribir test**

```bash
# Crear flexxus-picking-backend/tests/Unit/Services/WarehouseServiceTest.php
```

```php
<?php

namespace Tests\Unit\Services;

use App\Http\Clients\Flexxus\FlexxusClientInterface;
use App\Repositories\Flexxus\WarehouseRepositoryInterface;
use App\Services\Flexxus\WarehouseService;
use Tests\TestCase;
use Mockery;

class WarehouseServiceTest extends TestCase
{
    private WarehouseService $service;
    private $mockClient;
    private $mockRepository;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->mockClient = Mockery::mock(FlexxusClientInterface::class);
        $this->mockRepository = Mockery::mock(WarehouseRepositoryInterface::class);
        
        $this->service = new WarehouseService($this->mockClient, $this->mockRepository);
    }

    public function test_sync_warehouses_fetches_from_api_and_persists(): void
    {
        $flexxusData = [
            ['CODIGODEPOSITO' => '001', 'DESCRIPCION' => 'DON BOSCO', 'CLIENTE' => 'CLIENTE 1', 'SUCURSAL' => 'SUCURSAL 1', 'DEPOSITOVISIBLE' => 1],
        ];

        $this->mockClient->shouldReceive('getWarehouses')->once()->andReturn($flexxusData);
        $this->mockRepository->shouldReceive('syncFromFlexxus')->once()->with($flexxusData);

        $result = $this->service->syncFromFlexxus();

        $this->assertTrue($result);
    }

    public function test_get_active_warehouses_returns_from_repository(): void
    {
        $warehouses = collect([
            ['code' => '001', 'name' => 'Test'],
        ]);

        $this->mockRepository->shouldReceive('getActive')->once()->andReturn($warehouses);

        $result = $this->service->getActive();

        $this->assertCount(1, $result);
    }
}
```

**Step 2: Run test to verify it fails**

```bash
cd flexxus-picking-backend && php artisan test --filter=WarehouseServiceTest
```

Expected: FAIL

**Step 3: Implementar WarehouseServiceInterface**

```php
<?php

namespace App\Services\Flexxus;

use Illuminate\Support\Collection;

interface WarehouseServiceInterface
{
    public function syncFromFlexxus(): bool;
    public function getActive(): Collection;
    public function all(): Collection;
}
```

**Step 4: Implementar WarehouseService**

```php
<?php

namespace App\Services\Flexxus;

use App\Http\Clients\Flexxus\FlexxusClientInterface;
use App\Repositories\Flexxus\WarehouseRepositoryInterface;
use Illuminate\Support\Collection;

class WarehouseService implements WarehouseServiceInterface
{
    public function __construct(
        private FlexxusClientInterface $client,
        private WarehouseRepositoryInterface $repository
    ) {}

    public function syncFromFlexxus(): bool
    {
        $data = $this->client->getWarehouses();
        $this->repository->syncFromFlexxus($data);
        
        return true;
    }

    public function getActive(): Collection
    {
        return $this->repository->getActive();
    }

    public function all(): Collection
    {
        return $this->repository->all();
    }
}
```

**Step 5: Run test to verify it passes**

```bash
cd flexxus-picking-backend && php artisan test --filter=WarehouseServiceTest
```

Expected: PASS

**Step 6: Commit**

```bash
cd flexxus-picking-backend
git add app/Services/
git commit -m "feat: add WarehouseService for business logic"
```

---

## Task 5: Actualizar modelo Warehouse

**Files:**
- Modify: `flexxus-picking-backend/app/Models/Warehouse.php`

**Step 1: Modificar Warehouse.php**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Warehouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'client',
        'branch',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
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
}
```

**Step 2: Actualizar migración**

Verificar que la migración tenga los campos correctos:

```bash
# En database/migrations/2026_03_02_000001_create_warehouses_table.php
$table->string('code')->unique();
$table->string('name');
$table->string('client')->nullable();
$table->string('branch')->nullable();
$table->boolean('is_active')->default(true);
```

Si no existe, crear nueva migración:

```bash
php artisan make:migration update_warehouses_table_add_flexxus_fields
```

**Step 3: Commit**

```bash
cd flexxus-picking-backend
git add app/Models/Warehouse.php database/migrations/
git commit -m "feat: update Warehouse model with Flexxus fields"
```

---

## Task 6: Comando Artisan para sincronización

**Files:**
- Create: `flexxus-picking-backend/app/Console/Commands/Flexxus/SyncWarehousesCommand.php`

**Step 1: Escribir test**

```bash
# Crear flexxus-picking-backend/tests/Unit/Console/Commands/SyncWarehousesCommandTest.php
```

```php
<?php

namespace Tests\Unit\Console\Commands;

use App\Services\Flexxus\WarehouseServiceInterface;
use Tests\TestCase;
use Mockery;
use Illuminate\Support\FacadesArtisan;

class SyncWarehousesCommandTest extends TestCase
{
    public function test_command_calls_sync_service(): void
    {
        $mockService = Mockery::mock(WarehouseServiceInterface::class);
        $mockService->shouldReceive('syncFromFlexxus')->once()->andReturn(true);

        $this->app->instance(WarehouseServiceInterface::class, $mockService);

        Artisan::call('flexxus:sync-warehouses');

        $this->assertStringContainsString('Warehouses synced successfully', Artisan::output());
    }
}
```

**Step 2: Run test to verify it fails**

```bash
cd flexxus-picking-backend && php artisan test --filter=SyncWarehousesCommandTest
```

Expected: FAIL

**Step 3: Implementar comando**

```php
<?php

namespace App\Console\Commands\Flexxus;

use App\Services\Flexxus\WarehouseServiceInterface;
use Illuminate\Console\Command;

class SyncWarehousesCommand extends Command
{
    protected $signature = 'flexxus:sync-warehouses';
    protected $description = 'Sync warehouses from Flexxus API';

    public function __construct(
        private WarehouseServiceInterface $warehouseService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Syncing warehouses from Flexxus...');

        try {
            $this->warehouseService->syncFromFlexxus();
            $this->info('Warehouses synced successfully.');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to sync warehouses: ' . $e->getMessage());
            
            return Command::FAILURE;
        }
    }
}
```

**Step 4: Registrar en Kernel (si es Laravel < 11) o auto-discovery**

En Laravel 11+ los comandos se descubren automáticamente.

**Step 5: Run test to verify it passes**

```bash
cd flexxus-picking-backend && php artisan test --filter=SyncWarehousesCommandTest
```

Expected: PASS

**Step 6: Commit**

```bash
cd flexxus-picking-backend
git add app/Console/Commands/
git commit -m "feat: add flexxus:sync-warehouses command"
```

---

## Task 7: API para asignar depósito a usuario

**Files:**
- Modify: `flexxus-picking-backend/routes/api.php`
- Create: `flexxus-picking-backend/app/Http/Controllers/Api/Admin/WarehouseController.php`

**Step 1: Crear controller**

```php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;

class WarehouseController extends Controller
{
    public function assignToUser(int $userId, int $warehouseId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $warehouse = Warehouse::findOrFail($warehouseId);

        $user->warehouses()->syncWithoutDetaching([$warehouse->id]);

        return response()->json([
            'message' => 'Warehouse assigned successfully',
            'user' => $user->fresh()->load('warehouses'),
        ]);
    }

    public function removeFromUser(int $userId, int $warehouseId): JsonResponse
    {
        $user = User::findOrFail($userId);
        
        $user->warehouses()->detach($warehouseId);

        return response()->json([
            'message' => 'Warehouse removed successfully',
            'user' => $user->fresh()->load('warehouses'),
        ]);
    }

    public function getUserWarehouse(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        
        return response()->json([
            'warehouses' => $user->warehouses,
        ]);
    }
}
```

**Step 2: Agregar rutas**

```php
// routes/api.php
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    Route::post('/users/{user}/warehouses/{warehouse}', [WarehouseController::class, 'assignToUser']);
    Route::delete('/users/{user}/warehouses/{warehouse}', [WarehouseController::class, 'removeFromUser']);
    Route::get('/users/{user}/warehouses', [WarehouseController::class, 'getUserWarehouse']);
});
```

**Step 3: Escribir test de feature**

```bash
# Crear flexxus-picking-backend/tests/Feature/Admin/WarehouseAssignmentTest.php
```

```php
<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Warehouse;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class WarehouseAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_assign_warehouse_to_user(): void
    {
        $admin = User::factory()->create();
        $admin->givePermissionTo('admin');
        
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/users/{$user->id}/warehouses/{$warehouse->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user']);
        
        $this->assertDatabaseHas('user_warehouse', [
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
        ]);
    }

    public function test_admin_can_remove_warehouse_from_user(): void
    {
        $admin = User::factory()->create();
        $admin->givePermissionTo('admin');
        
        $user = User::factory()->create();
        $warehouse = Warehouse::factory()->create();
        $user->warehouses()->attach($warehouse->id);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/admin/users/{$user->id}/warehouses/{$warehouse->id}");

        $response->assertStatus(200);
        
        $this->assertDatabaseMissing('user_warehouse', [
            'user_id' => $user->id,
            'warehouse_id' => $warehouse->id,
        ]);
    }
}
```

**Step 4: Run test to verify it works**

```bash
cd flexxus-picking-backend && php artisan test --filter=WarehouseAssignmentTest
```

**Step 5: Commit**

```bash
cd flexxus-picking-backend
git add app/Http/Controllers/ routes/api.php tests/Feature/Admin/
git commit -m "feat: add API endpoints for warehouse assignment"
```

---

## Task 8: Integration test end-to-end

**Step 1: Test completo del flujo**

```bash
# Test que verifica: sync + assignment + retrieval
cd flexxus-picking-backend && php artisan test
```

Todos los tests deben pasar.

**Step 2: Commit final**

```bash
cd flexxus-picking-backend
git add .
git commit -m "feat: complete Flexxus warehouse integration"
```

---

## Resumen de archivos a crear/modificar

### Nuevos archivos
- `config/flexxus.php`
- `app/Http/Clients/Flexxus/FlexxusClient.php`
- `app/Http/Clients/Flexxus/FlexxusClientInterface.php`
- `app/Services/Flexxus/WarehouseService.php`
- `app/Services/Flexxus/WarehouseServiceInterface.php`
- `app/Repositories/Flexxus/WarehouseRepository.php`
- `app/Repositories/Flexxus/WarehouseRepositoryInterface.php`
- `app/Console/Commands/Flexxus/SyncWarehousesCommand.php`
- `app/Http/Controllers/Api/Admin/WarehouseController.php`
- Tests unitarios y de feature

### Archivos a modificar
- `.env` (agregar variables)
- `app/Models/Warehouse.php` (actualizar fillable)
- `routes/api.php` (agregar rutas)

---

## Ejecución

```bash
# Sincronizar depósitos desde Flexxus
php artisan flexxus:sync-warehouses

# Verificar funcionamiento
php artisan tinker
>>> app(\App\Services\Flexxus\WarehouseService::class)->getActive()
```
