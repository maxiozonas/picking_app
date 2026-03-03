# Auth System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement authentication system with warehouse management using Laravel Sanctum and Service Layer pattern.

**Architecture:** Monolito modular con Service Layer. Controllers delgados → Services (lógica de negocio) → Repositories (acceso a datos). Models con relationships. API Resources para respuestas consistentes.

**Tech Stack:** Laravel 12, Sanctum, MySQL (XAMPP), PHP 8.2, TDD with Pest/PestPHP

---

## Task 1: Configure Database Connection

**Files:**
- Modify: `flexxus-picking-backend/.env`

**Step 1: Edit .env file**

Replace the database configuration section:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=picking_app
DB_USERNAME=root
DB_PASSWORD=
```

**Step 2: Verify connection**

Run: `cd flexxus-picking-backend && php artisan db:show`

Expected output:
```
Database: picking_app
Connection: mysql
...
```

**Step 3: Commit**

```bash
git add .env
git commit -m "config: configure MySQL connection to picking_app"
```

---

## Task 2: Create Warehouses Table Migration

**Files:**
- Create: `flexxus-picking-backend/database/migrations/2026_03_02_000001_create_warehouses_table.php`

**Step 1: Generate migration**

Run: `cd flexxus-picking-backend && php artisan make:migration create_warehouses_table`

Expected: Migration file created in database/migrations

**Step 2: Edit migration file**

Replace the entire up() method:

```php
public function up(): void
{
    Schema::create('warehouses', function (Blueprint $table) {
        $table->id();
        $table->string('code')->unique()->comment('Código de Flexxus');
        $table->string('name')->comment('Nombre descriptivo');
        $table->string('flexxus_id')->nullable()->comment('ID en sistema Flexxus');
        $table->boolean('is_active')->default(true);
        $table->timestamps();

        $table->index('code');
        $table->index('is_active');
    });
}
```

Replace down() method:

```php
public function down(): void
{
    Schema::dropIfExists('warehouses');
}
```

**Step 3: Commit**

```bash
git add database/migrations/2026_03_02_000001_create_warehouses_table.php
git commit -m "feat: create warehouses table migration"
```

---

## Task 3: Modify Users Table Migration

**Files:**
- Modify: `flexxus-picking-backend/database/migrations/0001_01_01_000000_create_users_table.php`

**Step 1: Edit existing users migration**

Replace the up() method with:

```php
public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('username')->unique()->after('id');
        $table->string('name');
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        $table->foreignId('warehouse_id')->nullable()->after('password')->constrained()->nullOnDelete();
        $table->boolean('is_active')->default(true)->after('warehouse_id');
        $table->boolean('can_override_warehouse')->default(false)->after('is_active');
        $table->timestamp('override_expires_at')->nullable()->after('can_override_warehouse');
        $table->timestamp('last_login_at')->nullable()->after('override_expires_at');
        $table->rememberToken();
        $table->timestamps();

        $table->index('username');
        $table->index('warehouse_id');
        $table->index('is_active');
        $table->index('override_expires_at');
    });

    Schema::create('password_reset_tokens', function (Blueprint $table) {
        $table->string('email')->primary();
        $table->string('token');
        $table->timestamp('created_at')->nullable();
    });

    Schema::create('sessions', function (Blueprint $table) {
        $table->string('id')->primary();
        $table->foreignId('user_id')->nullable()->index();
        $table->string('ip_address', 45)->nullable();
        $table->text('user_agent')->nullable();
        $table->longText('payload');
        $table->integer('last_activity')->index();
    });
}
```

**Step 2: Commit**

```bash
git add database/migrations/0001_01_01_000000_create_users_table.php
git commit -m "feat: add warehouse and override fields to users table"
```

---

## Task 4: Create User_Warehouse Pivot Table Migration

**Files:**
- Create: `flexxus-picking-backend/database/migrations/2026_03_02_000002_create_user_warehouse_table.php`

**Step 1: Generate migration**

Run: `cd flexxus-picking-backend && php artisan make:migration create_user_warehouse_table`

Expected: Migration file created

**Step 2: Edit migration file**

Replace up() method:

```php
public function up(): void
{
    Schema::create('user_warehouse', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
        $table->timestamps();

        $table->unique(['user_id', 'warehouse_id']);
        $table->index('user_id');
        $table->index('warehouse_id');
    });
}
```

Replace down() method:

```php
public function down(): void
{
    Schema::dropIfExists('user_warehouse');
}
```

**Step 3: Commit**

```bash
git add database/migrations/2026_03_02_000002_create_user_warehouse_table.php
git commit -m "feat: create user_warehouse pivot table for override permissions"
```

---

## Task 5: Run Migrations

**Files:**
- No file changes

**Step 1: Drop existing tables if any**

Run: `cd flexxus-picking-backend && php artisan migrate:fresh`

Expected output:
```
Dropping all tables....
Migration table created successfully.
...
Migrating: 2026_03_02_000001_create_warehouses_table
Migrated:  2026_03_02_000001_create_warehouses_table (0.12ms)
...
Migrating: 2026_03_02_000002_create_user_warehouse_table
Migrated:  2026_03_02_000002_create_user_warehouse_table (0.09ms)
```

**Step 2: Verify tables created**

Run: `cd flexxus-picking-backend && php artisan db:table users`

Expected: Shows table structure with new columns

---

## Task 6: Create Warehouse Model

**Files:**
- Create: `flexxus-picking-backend/app/Models/Warehouse.php`

**Step 1: Create model**

Run: `cd flexxus-picking-backend && php artisan make:model Warehouse`

Expected: Model file created

**Step 2: Edit model file**

Replace entire content:

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
        'flexxus_id',
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

**Step 3: Commit**

```bash
git add app/Models/Warehouse.php
git commit -m "feat: create Warehouse model with relationships"
```

---

## Task 7: Update User Model

**Files:**
- Modify: `flexxus-picking-backend/app/Models/User.php`

**Step 1: Edit User model**

Replace entire content:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
        'warehouse_id',
        'is_active',
        'can_override_warehouse',
        'override_expires_at',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'can_override_warehouse' => 'boolean',
            'override_expires_at' => 'datetime',
            'last_login_at' => 'datetime',
        ];
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function availableWarehouses(): BelongsToMany
    {
        return $this->belongsToMany(Warehouse::class, 'user_warehouse')
            ->withTimestamps();
    }

    public function getCurrentWarehouseIdAttribute(): int
    {
        if ($this->override_expires_at && $this->override_expires_at->isFuture()) {
            return $this->getAttributes()['warehouse_id'] ?? $this->warehouse_id;
        }

        return $this->warehouse_id;
    }

    public function hasAccessToWarehouse(int $warehouseId): bool
    {
        if ($this->warehouse_id === $warehouseId) {
            return true;
        }

        if ($this->can_override_warehouse) {
            return $this->availableWarehouses()
                ->where('warehouses.id', $warehouseId)
                ->exists();
        }

        return false;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
```

**Step 2: Commit**

```bash
git add app/Models/User.php
git commit -m "feat: add warehouse relationships and override logic to User model"
```

---

## Task 8: Create Repository Interfaces

**Files:**
- Create: `flexxus-picking-backend/app/Repositories/Auth/AuthRepositoryInterface.php`

**Step 1: Create Repositories directory and interface**

Run: `mkdir -p flexxus-picking-backend/app/Repositories/Auth`

Create file with content:

```php
<?php

namespace App\Repositories\Auth;

use App\Models\User;

interface AuthRepositoryInterface
{
    public function findByUsername(string $username): ?User;
    public function updateLastLogin(User $user): void;
    public function setWarehouseOverride(User $user, int $warehouseId, \DateTime $expiresAt): void;
    public function clearWarehouseOverride(User $user): void;
    public function getAvailableWarehouses(User $user): \Illuminate\Support\Collection;
}
```

**Step 2: Commit**

```bash
git add app/Repositories/Auth/AuthRepositoryInterface.php
git commit -m "feat: create AuthRepositoryInterface"
```

---

## Task 9: Create Auth Repository Implementation

**Files:**
- Create: `flexxus-picking-backend/app/Repositories/Auth/AuthRepository.php`

**Step 1: Create repository implementation**

Create file with content:

```php
<?php

namespace App\Repositories\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class AuthRepository implements AuthRepositoryInterface
{
    public function findByUsername(string $username): ?User
    {
        return User::with(['warehouse', 'availableWarehouses'])
            ->where('username', $username)
            ->first();
    }

    public function updateLastLogin(User $user): void
    {
        $user->update(['last_login_at' => now()]);
    }

    public function setWarehouseOverride(User $user, int $warehouseId, \DateTime $expiresAt): void
    {
        DB::table('users')
            ->where('id', $user->id)
            ->update([
                'warehouse_id' => $warehouseId,
                'override_expires_at' => $expiresAt,
            ]);
    }

    public function clearWarehouseOverride(User $user): void
    {
        $originalWarehouse = DB::table('users')
            ->where('id', $user->id)
            ->value('warehouse_id');

        DB::table('users')
            ->where('id', $user->id)
            ->update([
                'override_expires_at' => null,
            ]);
    }

    public function getAvailableWarehouses(User $user): \Illuminate\Support\Collection
    {
        return $user->availableWarehouses()->active()->get();
    }
}
```

**Step 2: Commit**

```bash
git add app/Repositories/Auth/AuthRepository.php
git commit -m "feat: implement AuthRepository with warehouse override logic"
```

---

## Task 10: Create Service Interface

**Files:**
- Create: `flexxus-picking-backend/app/Services/Auth/AuthServiceInterface.php`

**Step 1: Create Services directory and interface**

Run: `mkdir -p flexxus-picking-backend/app/Services/Auth`

Create file with content:

```php
<?php

namespace App\Services\Auth;

use App\Models\User;

interface AuthServiceInterface
{
    public function login(string $username, string $password): array;
    public function logout(User $user): void;
    public function me(User $user): array;
    public function overrideWarehouse(User $user, int $warehouseId, int $durationMinutes): array;
    public function clearOverride(User $user): void;
    public function canAccessWarehouse(User $user, int $warehouseId): bool;
}
```

**Step 2: Commit**

```bash
git add app/Services/Auth/AuthServiceInterface.php
git commit -m "feat: create AuthServiceInterface"
```

---

## Task 11: Create Auth Service

**Files:**
- Create: `flexxus-picking-backend/app/Services/Auth/AuthService.php`

**Step 1: Create service implementation**

Create file with content:

```php
<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Repositories\Auth\AuthRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService implements AuthServiceInterface
{
    public function __construct(
        private AuthRepositoryInterface $authRepository
    ) {}

    public function login(string $username, string $password): array
    {
        $user = $this->authRepository->findByUsername($username);

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Credenciales inválidas'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'username' => ['Usuario inactivo. Contacte al administrador.'],
            ]);
        }

        $this->authRepository->updateLastLogin($user);

        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $this->formatUserWithWarehouse($user),
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function me(User $user): array
    {
        // Refresh user from DB to get latest override status
        $user->load(['warehouse', 'availableWarehouses']);

        return [
            'user' => $this->formatUserWithWarehouse($user),
        ];
    }

    public function overrideWarehouse(User $user, int $warehouseId, int $durationMinutes): array
    {
        if (! $user->can_override_warehouse) {
            throw ValidationException::withMessages([
                'warehouse_id' => ['No tienes permiso para cambiar de depósito'],
            ]);
        }

        if (! $this->canAccessWarehouse($user, $warehouseId)) {
            throw ValidationException::withMessages([
                'warehouse_id' => ['No tienes acceso a este depósito'],
            ]);
        }

        $expiresAt = now()->addMinutes($durationMinutes);
        $this->authRepository->setWarehouseOverride($user, $warehouseId, $expiresAt);

        $user->refresh()->load(['warehouse']);

        return [
            'override_expires_at' => $expiresAt->toIso8601String(),
            'current_warehouse' => [
                'id' => $user->warehouse->id,
                'code' => $user->warehouse->code,
                'name' => $user->warehouse->name,
            ],
        ];
    }

    public function clearOverride(User $user): void
    {
        $this->authRepository->clearWarehouseOverride($user);
    }

    public function canAccessWarehouse(User $user, int $warehouseId): bool
    {
        return $user->hasAccessToWarehouse($warehouseId);
    }

    private function formatUserWithWarehouse(User $user): array
    {
        $warehouse = $user->warehouse;
        $isOverride = $user->override_expires_at && $user->override_expires_at->isFuture();

        $data = [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->name,
            'can_override_warehouse' => $user->can_override_warehouse,
            'override_expires_at' => $user->override_expires_at?->toIso8601String(),
            'current_warehouse' => [
                'id' => $warehouse->id,
                'code' => $warehouse->code,
                'name' => $warehouse->name,
                'is_override' => $isOverride,
            ],
        ];

        if ($user->can_override_warehouse) {
            $data['available_warehouses'] = $this->authRepository
                ->getAvailableWarehouses($user)
                ->map(fn ($w) => [
                    'id' => $w->id,
                    'code' => $w->code,
                    'name' => $w->name,
                ])
                ->values();
        }

        return $data;
    }
}
```

**Step 2: Commit**

```bash
git add app/Services/Auth/AuthService.php
git commit -m "feat: implement AuthService with login and override logic"
```

---

## Task 12: Register Service Provider Bindings

**Files:**
- Modify: `flexxus-picking-backend/app/Providers/AppServiceProvider.php`

**Step 1: Edit AppServiceProvider**

Add to register() method:

```php
public function register(): void
{
    $this->app->bind(
        \App\Services\Auth\AuthServiceInterface::class,
        \App\Services\Auth\AuthService::class
    );

    $this->app->bind(
        \App\Repositories\Auth\AuthRepositoryInterface::class,
        \App\Repositories\Auth\AuthRepository::class
    );
}
```

**Step 2: Commit**

```bash
git add app/Providers/AppServiceProvider.php
git commit -m "feat: register auth service and repository bindings"
```

---

## Task 13: Create Login Request

**Files:**
- Create: `flexxus-picking-backend/app/Http/Requests/LoginRequest.php`

**Step 1: Create request**

Run: `cd flexxus-picking-backend && php artisan make:request LoginRequest`

Edit file:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => 'required|string|max:255',
            'password' => 'required|string|min:6',
        ];
    }
}
```

**Step 2: Commit**

```bash
git add app/Http/Requests/LoginRequest.php
git commit -m "feat: create LoginRequest validation"
```

---

## Task 14: Create OverrideWarehouse Request

**Files:**
- Create: `flexxus-picking-backend/app/Http/Requests/OverrideWarehouseRequest.php`

**Step 1: Create request**

Run: `cd flexxus-picking-backend && php artisan make:request OverrideWarehouseRequest`

Edit file:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OverrideWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => 'required|integer|exists:warehouses,id',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
        ];
    }

    public function getDurationMinutes(): int
    {
        return $this->input('duration_minutes', 60);
    }
}
```

**Step 2: Commit**

```bash
git add app/Http/Requests/OverrideWarehouseRequest.php
git commit -m "feat: create OverrideWarehouseRequest validation"
```

---

## Task 15: Create Auth Resource

**Files:**
- Create: `flexxus-picking-backend/app/Http/Resources/AuthResource.php`

**Step 1: Create resource**

Run: `cd flexxus-picking-backend && php artisan make:resource AuthResource`

Edit file:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'success' => true,
            'data' => $this->resource,
        ];
    }
}
```

**Step 2: Commit**

```bash
git add app/Http/Resources/AuthResource.php
git commit -m "feat: create AuthResource for consistent API responses"
```

---

## Task 16: Create API Routes File

**Files:**
- Create: `flexxus-picking-backend/routes/api.php`

**Step 1: Create routes file**

Create file with content:

```php
<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/override-warehouse', [AuthController::class, 'overrideWarehouse']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/clear-override', [AuthController::class, 'clearOverride']);
    });
});
```

**Step 2: Commit**

```bash
git add routes/api.php
git commit -m "feat: create auth API routes"
```

---

## Task 17: Configure API Routes in Application

**Files:**
- Modify: `flexxus-picking-backend/bootstrap/app.php`

**Step 1: Edit bootstrap/app.php**

Modify withRouting() call to include api.php:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
)
```

**Step 2: Commit**

```bash
git add bootstrap/app.php
git commit -m "config: register API routes file"
```

---

## Task 18: Configure Sanctum Middleware

**Files:**
- Modify: `flexxus-picking-backend/bootstrap/app.php`

**Step 1: Edit middleware configuration**

Modify withMiddleware() call:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);

    $middleware->alias([
        'auth' => \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
    ]);
})
```

**Step 2: Commit**

```bash
git add bootstrap/app.php
git commit -m "config: configure Sanctum middleware for API"
```

---

## Task 19: Update Sanctum Stateful Domains

**Files:**
- Modify: `flexxus-picking-backend/.env`

**Step 1: Add stateful domains to .env**

Add to .env:

```env
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8000,localhost:19000,localhost:19001,127.0.0.1:8000
```

**Step 2: Commit**

```bash
git add .env
git commit -m "config: add Expo stateful domains to Sanctum"
```

---

## Task 20: Create Auth Controller

**Files:**
- Create: `flexxus-picking-backend/app/Http/Controllers/Api/AuthController.php`

**Step 1: Create Api directory and controller**

Run: `mkdir -p flexxus-picking-backend/app/Http/Controllers/Api`

Create controller with content:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\OverrideWarehouseRequest;
use App\Http\Resources\AuthResource;
use App\Services\Auth\AuthServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private AuthServiceInterface $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->login(
                $request->input('username'),
                $request->input('password')
            );

            return (new AuthResource($data))
                ->response()
                ->setStatusCode(200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 401);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $data = $this->authService->me($request->user());

        return (new AuthResource($data))
            ->response()
            ->setStatusCode(200);
    }

    public function overrideWarehouse(OverrideWarehouseRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->overrideWarehouse(
                $request->user(),
                $request->input('warehouse_id'),
                $request->getDurationMinutes()
            );

            return (new AuthResource($data))
                ->response()
                ->setStatusCode(200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 403);
        }
    }

    public function clearOverride(Request $request): JsonResponse
    {
        $this->authService->clearOverride($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Override de depósito eliminado',
        ]);
    }
}
```

**Step 2: Commit**

```bash
git add app/Http/Controllers/Api/AuthController.php
git commit -m "feat: implement AuthController with login and override endpoints"
```

---

## Task 21: Create Warehouse Seeder

**Files:**
- Create: `flexxus-picking-backend/database/seeders/WarehouseSeeder.php`

**Step 1: Generate seeder**

Run: `cd flexxus-picking-backend && php artisan make:seeder WarehouseSeeder`

Edit file:

```php
<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        $warehouses = [
            [
                'code' => 'DEPO-CEN',
                'name' => 'Depósito Central',
                'flexxus_id' => '1',
                'is_active' => true,
            ],
            [
                'code' => 'DEPO-NOR',
                'name' => 'Depósito Norte',
                'flexxus_id' => '2',
                'is_active' => true,
            ],
            [
                'code' => 'DEPO-SUR',
                'name' => 'Depósito Sur',
                'flexxus_id' => '3',
                'is_active' => true,
            ],
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::create($warehouse);
        }
    }
}
```

**Step 2: Commit**

```bash
git add database/seeders/WarehouseSeeder.php
git commit -m "feat: create WarehouseSeeder with sample data"
```

---

## Task 22: Create User Seeder

**Files:**
- Create: `flexxus-picking-backend/database/seeders/UserSeeder.php`

**Step 1: Generate seeder**

Run: `cd flexxus-picking-backend && php artisan make:seeder UserSeeder`

Edit file:

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $centralWarehouse = Warehouse::where('code', 'DEPO-CEN')->first();

        // Admin user with override permission
        $admin = User::create([
            'username' => 'admin',
            'name' => 'Administrador',
            'email' => 'admin@picking.app',
            'password' => bcrypt('password'),
            'warehouse_id' => $centralWarehouse->id,
            'is_active' => true,
            'can_override_warehouse' => true,
        ]);

        // Give admin access to all warehouses
        $admin->availableWarehouses()->attach(Warehouse::pluck('id'));

        // Regular operator
        User::create([
            'username' => 'operario1',
            'name' => 'Operario Depósito Central',
            'email' => 'operario1@picking.app',
            'password' => bcrypt('password'),
            'warehouse_id' => $centralWarehouse->id,
            'is_active' => true,
            'can_override_warehouse' => false,
        ]);
    }
}
```

**Step 2: Commit**

```bash
git add database/seeders/UserSeeder.php
git commit -m "feat: create UserSeeder with admin and operator accounts"
```

---

## Task 23: Register Seeders in DatabaseSeeder

**Files:**
- Modify: `flexxus-picking-backend/database/seeders/DatabaseSeeder.php`

**Step 1: Edit DatabaseSeeder**

Edit call() method:

```php
public function run(): void
{
    $this->call([
        WarehouseSeeder::class,
        UserSeeder::class,
    ]);
}
```

**Step 2: Commit**

```bash
git add database/seeders/DatabaseSeeder.php
git commit -m "feat: register WarehouseSeeder and UserSeeder"
```

---

## Task 24: Run Seeders

**Files:**
- No file changes

**Step 1: Execute seeders**

Run: `cd flexxus-picking-backend && php artisan db:seed`

Expected output:
```
Seeding: Database\Seeders\WarehouseSeeder
Seeding: Database\Seeders\UserSeeder
Database seeding completed successfully.
```

**Step 2: Verify seeded data**

Run: `cd flexxus-picking-backend && php artisan tinker --execute="echo User::count(); echo Warehouse::count();"`

Expected: Output shows 2 users and 3 warehouses

---

## Task 25: Test Login Endpoint

**Files:**
- No file changes

**Step 1: Start development server**

Run: `cd flexxus-picking-backend && php artisan serve`

Expected: Server running on http://127.0.0.1:8000

**Step 2: Test login with Postman/curl**

Run in separate terminal:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"username":"admin","password":"password"}'
```

Expected response:

```json
{
  "success": true,
  "data": {
    "token": "1|xxxxxxxxxxxxxx",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrador",
      "can_override_warehouse": true,
      "override_expires_at": null,
      "current_warehouse": {
        "id": 1,
        "code": "DEPO-CEN",
        "name": "Depósito Central",
        "is_override": false
      },
      "available_warehouses": [
        {"id": 1, "code": "DEPO-CEN", "name": "Depósito Central"},
        {"id": 2, "code": "DEPO-NOR", "name": "Depósito Norte"},
        {"id": 3, "code": "DEPO-SUR", "name": "Depósito Sur"}
      ]
    }
  }
}
```

**Step 3: Test invalid credentials**

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"username":"admin","password":"wrongpassword"}'
```

Expected: 401 with error message

**Step 4: Save token for next tests**

Copy the token from response for authenticated requests

---

## Task 26: Test Authenticated Endpoints

**Files:**
- No file changes

**Step 1: Test /api/auth/me**

Replace `{TOKEN}` with actual token:

```bash
curl -X GET http://127.0.0.1:8000/api/auth/me \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json"
```

Expected: Returns user data with warehouse

**Step 2: Test warehouse override**

```bash
curl -X POST http://127.0.0.1:8000/api/auth/override-warehouse \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"warehouse_id":2,"duration_minutes":60}'
```

Expected: Returns new warehouse with override_expires_at

**Step 3: Test /api/auth/me after override**

```bash
curl -X GET http://127.0.0.1:8000/api/auth/me \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json"
```

Expected: current_warehouse shows DEPO-NOR with is_override: true

**Step 4: Test logout**

```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json"
```

Expected: Success message

**Step 5: Verify token is revoked**

Try to use same token again

Expected: 401 Unauthorized

---

## Task 27: Add Rate Limiting to Login

**Files:**
- Modify: `flexxus-picking-backend/bootstrap/app.php`

**Step 1: Configure rate limiting**

Edit withMiddleware() call:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);

    $middleware->alias([
        'auth' => \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
    ]);

    $middleware->rateLimiter('auth', function (Limit $limit) {
        return $limit->by('ip')->limit(5, everyMinute: 1);
    });
})
```

**Step 2: Apply to login route**

Edit `routes/api.php`:

```php
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:auth');

    // ... other routes
});
```

**Step 3: Commit**

```bash
git add bootstrap/app.php routes/api.php
git commit -m "feat: add rate limiting to login endpoint"
```

---

## Task 28: Create API Documentation

**Files:**
- Create: `flexxus-picking-backend/docs/api-auth.md`

**Step 1: Create documentation file**

Run: `mkdir -p flexxus-picking-backend/docs`

Create file with content:

```markdown
# Authentication API Documentation

## Base URL
```
http://127.0.0.1:8000/api
```

## Endpoints

### POST /auth/login

Autentica usuario y retorna token.

**Request:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "1|xxxxxxxxxxx",
    "user": { ... }
  }
}
```

**Rate Limit:** 5 attempts per minute per IP

### GET /auth/me

Retorna datos del usuario autenticado.

**Headers:** `Authorization: Bearer {token}`

### POST /auth/logout

Cierra sesión y revoca token.

**Headers:** `Authorization: Bearer {token}`

### POST /auth/override-warehouse

Cambia temporalmente el depósito del usuario.

**Request:**
```json
{
  "warehouse_id": 2,
  "duration_minutes": 60
}
```

**Headers:** `Authorization: Bearer {token}`

**Permission:** `can_override_warehouse = true`

## Test Credentials

**Admin:**
- Username: `admin`
- Password: `password`
- Can override: Yes

**Operator:**
- Username: `operario1`
- Password: `password`
- Can override: No
```

**Step 2: Commit**

```bash
git add docs/api-auth.md
git commit -m "docs: add authentication API documentation"
```

---

## Task 29: Update README

**Files:**
- Modify: `flexxus-picking-backend/README.md`

**Step 1: Edit README.md**

Replace with:

```markdown
# Flexxus Picking Backend

Backend API Laravel para aplicación de armado de pedidos.

## Stack
- Laravel 12
- MySQL (XAMPP)
- Laravel Sanctum (API auth)
- Service Layer Pattern

## Instalación

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

## Configuración

Editar `.env`:
```env
DB_DATABASE=picking_app
DB_USERNAME=root
DB_PASSWORD=
```

## Credenciales de Prueba

**Admin:**
- Username: `admin`
- Password: `password`
- Permisos: Override de depósito habilitado

**Operador:**
- Username: `operario1`
- Password: `password`
- Permisos: Solo depósito asignado

## API Endpoints

Ver documentación completa: [docs/api-auth.md](docs/api-auth.md)

## Arquitectura

- **Services:** `app/Services/` - Lógica de negocio
- **Repositories:** `app/Repositories/` - Acceso a datos
- **Controllers:** `app/Http/Controllers/Api/` - Endpoints HTTP
- **Models:** `app/Models/` - Modelos Eloquent

## Desarrollo

```bash
php artisan migrate:fresh --seed  # Reset DB con datos de prueba
php artisan serve                 # Servidor de desarrollo
php artisan test                   # Ejecutar tests
```
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with installation and credentials"
```

---

## Task 30: Final Integration Test

**Files:**
- No file changes

**Step 1: Complete user flow test**

Test complete flow:

1. Login as admin ✅
2. Get current user ✅
3. Override to DEPO-NOR ✅
4. Verify override active ✅
5. Clear override ✅
6. Back to original warehouse ✅
7. Logout ✅
8. Verify token revoked ✅

**Step 2: Test with regular operator**

1. Login as operario1 ✅
2. Verify no available_warehouses ✅
3. Attempt override (should fail) ✅
4. Logout ✅

**Step 3: Test rate limiting**

1. Send 6 failed login attempts ✅
2. Verify 5th returns 429 (Too Many Requests) ✅

**Step 4: Test inactive user**

1. Create test inactive user via tinker ✅
2. Attempt login ✅
3. Verify 403 with "Usuario inactivo" ✅

**Step 5: Verify database integrity**

Run: `cd flexxus-picking-backend && php artisan db:table users && php artisan db:table warehouses && php artisan db:table user_warehouse`

Expected: All tables with correct data and relationships

---

## Task 31: Create Feature Tests (Optional but Recommended)

**Files:**
- Create: `flexxus-picking-backend/tests/Feature/Auth/LoginTest.php`
- Create: `flexxus-picking-backend/tests/Feature/Auth/WarehouseOverrideTest.php`
- Create: `flexxus-picking-backend/tests/Feature/Auth/MiddlewareTest.php`

**Step 1: Create LoginTest**

```php
<?php

use App\Models\User;

test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'username' => $user->username,
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                'token',
                'user' => [
                    'id',
                    'username',
                    'current_warehouse',
                ],
            ],
        ]);
});

test('login fails with invalid credentials', function () {
    $response = $this->postJson('/api/auth/login', [
        'username' => 'nonexistent',
        'password' => 'wrong',
    ]);

    $response->assertStatus(401);
});

test('inactive user cannot login', function () {
    $user = User::factory()->create([
        'is_active' => false,
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'username' => $user->username,
        'password' => 'password123',
    ]);

    $response->assertStatus(401);
});
```

**Step 2: Run tests**

Run: `cd flexxus-picking-backend && php artisan test --filter=LoginTest`

Expected: All tests pass

**Step 3: Commit**

```bash
git add tests/
git commit -m "test: add authentication feature tests"
```

---

## Task 32: Final Commit and Tag

**Files:**
- No file changes

**Step 1: Review all commits**

Run: `cd flexxus-picking-backend && git log --oneline --graph -10`

Verify all commits are present and clean

**Step 2: Create final commit**

```bash
git commit --allow-empty -m "chore: auth system implementation complete - Phase 1"
```

**Step 3: Create tag**

Run: `cd flexxus-picking-backend && git tag -a v0.1.0 -m "Phase 1: Auth System with Warehouse Management"`

**Step 4: Push to remote (if applicable)**

```bash
git push origin main
git push origin v0.1.0
```

---

## Summary

✅ **Complete Implementation:**
- Database schema with warehouse support
- User model with override capabilities
- Service Layer (AuthService + AuthRepository)
- API endpoints (login, logout, me, override-warehouse)
- Token-based authentication with Sanctum
- Rate limiting on login
- Seed data for testing
- API documentation
- Feature tests (optional)

**Next Steps:**
- Phase 1 continues: Flexxus integration service
- Fetch warehouses from Flexxus API
- Fetch orders from Flexxus API
- Order listing and detail endpoints

**Test Accounts:**
- Admin: `admin` / `password` (with override)
- Operator: `operario1` / `password` (without override)
