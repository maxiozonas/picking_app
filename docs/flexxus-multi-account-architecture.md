# Multi-Account Flexxus Architecture

## Overview

The Multi-Account Flexxus Architecture enables each warehouse to have its own Flexxus ERP credentials, allowing the system to interact with multiple Flexxus accounts or instances simultaneously.

**Problem Solved:**
- Previously: Single global Flexxus credentials for all warehouses
- Now: Each warehouse has its own credentials (encrypted in database)

**Benefits:**
- Multi-tenant: Support different Flexxus accounts per warehouse
- Security: Credentials are encrypted at rest
- Flexibility: Easy to add/remove warehouses without code changes
- Fallback: Backward compatibility with global config

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Laravel Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────────┐             │
│  │   Controller │────────▶│ PickingService   │             │
│  └──────────────┘         └──────────────────┘             │
│                                    │                         │
│                                    ▼                         │
│  ┌───────────────────────────────────────────────────┐    │
│  │     FlexxusClientFactory (Factory Pattern)        │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ createForWarehouse(Warehouse $warehouse)     │ │    │
│  │  │   → Reads encrypted credentials from DB      │ │    │
│  │  │   → Falls back to config() if NULL           │ │    │
│  │  │   → Creates FlexxusClient with credentials   │ │    │
│  │  │   → Scopes token cache by warehouse.code     │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └───────────────────────────────────────────────────┘    │
│                                    │                         │
│                                    ▼                         │
│  ┌───────────────────────────────────────────────────┐    │
│  │         FlexxusClient (HTTP Wrapper)              │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │ • Authentication (token management)          │ │    │
│  │  │ • Token caching (per warehouse)              │ │    │
│  │  │ • API requests (GET/POST)                    │ │    │
│  │  │ • Error handling & retries                   │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   Flexxus ERP API                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │ Account A │  │ Account B │  │ Account C │              │
│  │ (CENTRO)  │  │ (NORTE)   │  │ (OESTE)   │              │
│  └───────────┘  └───────────┘  └───────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `warehouses` Table

```php
Schema::create('warehouses', function (Blueprint $table) {
    $table->id();
    $table->string('code')->unique(); // e.g., 'CENTRO', 'NORTE'
    $table->string('name');
    $table->string('client');
    $table->string('branch');
    $table->boolean('is_active')->default(true);

    // Flexxus credentials (encrypted at rest)
    $table->string('flexxus_url')->nullable();
    $table->string('flexxus_username')->nullable();
    $table->string('flexxus_password')->nullable();

    $table->timestamps();
});
```

**Encrypted Fields:**
- `flexxus_username` - Encrypted using Laravel's `encrypted` cast
- `flexxus_password` - Encrypted using Laravel's `encrypted` cast
- `flexxus_url` - Plain text (URLs are not sensitive)

**Encryption:**
- Uses Laravel's built-in encryption (APP_KEY)
- Automatically decrypted when accessed via Eloquent model
- Encrypted when stored in database

---

## Implementation

### 1. Warehouse Model

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
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
        'flexxus_username' => 'encrypted',  // Auto-encrypt/decrypt
        'flexxus_password' => 'encrypted',  // Auto-encrypt/decrypt
    ];

    // Helper method to check if credentials are complete
    public function hasCompleteFlexxusCredentials(): bool
    {
        return !empty($this->flexxus_url) &&
               !empty($this->flexxus_username) &&
               !empty($this->flexxus_password);
    }

    // Local scope for active warehouses
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
```

### 2. FlexxusClientFactory

**Interface:**

```php
namespace App\Services\Picking\Interfaces;

use App\Models\Warehouse;
use App\Http\Clients\Flexxus\FlexxusClient;

interface FlexxusClientFactoryInterface
{
    public function createForWarehouse(Warehouse $warehouse): FlexxusClient;
}
```

**Implementation:**

```php
namespace App\Services\Picking;

use App\Http\Clients\Flexxus\FlexxusClient;
use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;

class FlexxusClientFactory implements FlexxusClientFactoryInterface
{
    public function createForWarehouse(Warehouse $warehouse): FlexxusClient
    {
        // Get credentials from warehouse (auto-decrypted)
        $baseUrl = $warehouse->flexxus_url ?? config('flexxus.url');
        $username = $warehouse->flexxus_username ?? config('flexxus.username');
        $password = $warehouse->flexxus_password ?? config('flexxus.password');
        $deviceInfo = config('flexxus.device_info');

        // Use warehouse code as cache suffix (scopes tokens per warehouse)
        $cacheSuffix = $warehouse->code;

        return new FlexxusClient(
            $baseUrl,
            $username,
            $password,
            $deviceInfo,
            $cacheSuffix
        );
    }
}
```

**Dependency Injection (AppServiceProvider):**

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;
use App\Services\Picking\FlexxusClientFactory;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            FlexxusClientFactoryInterface::class,
            FlexxusClientFactory::class
        );
    }
}
```

### 3. Usage in Services

```php
namespace App\Services\Picking;

use App\Models\Warehouse;
use App\Services\Picking\Interfaces\FlexxusClientFactoryInterface;

class FlexxusPickingService
{
    public function __construct(
        private FlexxusClientFactoryInterface $clientFactory
    ) {}

    public function getProductStock(
        string $productCode,
        Warehouse $warehouse
    ): array {
        // Create warehouse-specific client
        $client = $this->clientFactory->createForWarehouse($warehouse);

        // Fetch from Flexxus using warehouse's credentials
        $product = $client->getProduct($productCode);

        return [
            'available' => $product['STOCKTOTALDEPOSITO'] ?? 0,
            'warehouse_id' => $warehouse->id,
        ];
    }
}
```

---

## Token Caching Strategy

### Cache Key Format

```
flexxus_token_{warehouse_code}
```

**Examples:**
- `flexxus_token_CENTRO` - Token for CENTRO warehouse
- `flexxus_token_NORTE` - Token for NORTE warehouse

### Cache Duration

Default: 55 minutes (Flexxus tokens expire after 60 minutes)

```php
// In FlexxusClient
$token = Cache::remember(
    "flexxus_token_{$this->cacheKeySuffix}",
    55 * 60,  // 55 minutes
    fn() => $this->authenticate()
);
```

### Benefits of Per-Warehouse Caching

1. **No Token Collision:** Each warehouse has its own token
2. **Independent Expiration:** One warehouse's token expiring doesn't affect others
3. **Parallel Authentication:** Can authenticate multiple warehouses simultaneously
4. **Easy Invalidation:** Can clear tokens per warehouse: `Cache::forget('flexxus_token_CENTRO')`

---

## Backward Compatibility

### Config Fallback

If a warehouse has no credentials configured (NULL values), the system falls back to global configuration:

```php
// In FlexxusClientFactory
$baseUrl = $warehouse->flexxus_url ?? config('flexxus.url');
$username = $warehouse->flexxus_username ?? config('flexxus.username');
$password = $warehouse->flexxus_password ?? config('flexxus.password');
```

**Configuration File:** `config/flexxus.php`

```php
return [
    'url' => env('FLEXXUS_URL'),
    'username' => env('FLEXXUS_USERNAME'),
    'password' => env('FLEXXUS_PASSWORD'),
    'device_info' => [
        'device_name' => env('FLEXXUS_DEVICE_NAME', 'PickingApp'),
        'device_id' => env('FLEXXUS_DEVICE_ID', 'PA-001'),
    ],
];
```

**Migration Path:**

1. Start with global credentials in `.env`
2. Add warehouse-specific credentials via Admin API
3. Remove global credentials once all warehouses are migrated

---

## Security Considerations

### Encryption

- **Algorithm:** AES-256-CBC (Laravel default)
- **Key:** APP_KEY from `.env` file
- **Encoding:** Base64

**Important:** If you change `APP_KEY`, all encrypted passwords will be corrupted. You must re-encrypt all credentials.

### Access Control

**Who Can Manage Credentials?**

Only administrators can manage warehouse Flexxus credentials:

- `PUT /api/admin/warehouses/{warehouse}/flexxus-credentials` - Update credentials
- `DELETE /api/admin/warehouses/{warehouse}/flexxus-credentials` - Clear credentials

**Authorization:**

```php
// In WarehouseController
public function updateFlexxusCredentials(Request $request, int $warehouseId)
{
    // Only admins can access this endpoint
    if ($request->user()->role !== 'admin') {
        abort(403, 'This action is unauthorized.');
    }

    // ... update logic
}
```

### Logging

All credential operations are logged:

```php
Log::info('Warehouse Flexxus credentials updated', [
    'warehouse_id' => $warehouse->id,
    'user_id' => $request->user()->id,
    'username_updated' => !empty($validated['flexxus_username']),
    'password_updated' => !empty($validated['flexxus_password']),
]);
```

**Note:** Passwords are NEVER logged (only whether they were updated).

---

## Testing

### Unit Test Example

```php
public function test_warehouse_credentials_are_encrypted()
{
    $warehouse = Warehouse::factory()->create([
        'flexxus_username' => 'test_user',
        'flexxus_password' => 'test_password',
    ]);

    // Verify encrypted in database
    $dbPassword = DB::table('warehouses')
        ->where('id', $warehouse->id)
        ->value('flexxus_password');

    $this->assertNotEquals('test_password', $dbPassword);
    $this->assertNotEmpty($dbPassword);

    // Verify decrypted when accessed
    $this->assertEquals('test_password', $warehouse->flexxus_password);
}

public function test_fallback_to_config_when_credentials_null()
{
    Config::set('flexxus.username', 'global_user');
    Config::set('flexxus.password', 'global_pass');

    $warehouse = Warehouse::factory()->create([
        'flexxus_username' => null,
        'flexxus_password' => null,
    ]);

    $factory = new FlexxusClientFactory();
    $client = $factory->createForWarehouse($warehouse);

    // Should use global config
    $reflection = new \ReflectionClass($client);
    $usernameProp = $reflection->getProperty('username');
    $usernameProp->setAccessible(true);

    $this->assertEquals('global_user', $usernameProp->getValue($client));
}
```

---

## Migration from Global Credentials

### Step 1: Backup Current Credentials

```bash
# View current global credentials
cat .env | grep FLEXXUS
```

### Step 2: Run Migration Command

```bash
# Migrate global credentials to all warehouses
php artisan flexxus:migrate-credentials

# Migrate to a specific warehouse
php artisan flexxus:migrate-credentials --warehouse=CENTRO

# Dry run (see what will happen)
php artisan flexxus:migrate-credentials --dry-run
```

### Step 3: Verify Migration

```bash
# Check database
php artisan tinker
>>> Warehouse::pluck('code', 'id')
>>> App\Models\Warehouse::first()->hasCompleteFlexxusCredentials()
```

### Step 4: Test with Warehouse Credentials

```bash
# Test API with warehouse-specific credentials
curl -X GET http://localhost:8000/api/picking/orders \
  -H "Authorization: Bearer {token}" \
  -H "X-Warehouse-Override: 1"
```

### Step 5: Remove Global Credentials (Optional)

```bash
# Once all warehouses have credentials, remove from .env
# Comment out or remove:
# FLEXXUS_USERNAME=xxx
# FLEXXUS_PASSWORD=xxx
```

### Rollback

```bash
# If something goes wrong, rollback
php artisan flexxus:reset-credentials --warehouse=CENTRO
```

---

## Performance Considerations

### Database Queries

```php
// ❌ BAD: N+1 query
$warehouses = Warehouse::all();
foreach ($warehouses as $warehouse) {
    $client = $factory->createForWarehouse($warehouse);  // Queries DB each time
}

// ✅ GOOD: Single query
$warehouses = Warehouse::all();  // Loaded once with encrypted casts
foreach ($warehouses as $warehouse) {
    $client = $factory->createForWarehouse($warehouse);  // No additional queries
}
```

### Token Caching

```php
// Tokens are cached per warehouse (55 min TTL)
// First call: Authenticates and caches
$client1 = $factory->createForWarehouse($warehouse1);
$client1->getOrders();  // Authenticates + caches token

// Second call: Uses cached token
$client2 = $factory->createForWarehouse($warehouse1);
$client2->getOrders();  // Uses cached token (no auth)
```

---

## Troubleshooting

### Issue: "Decryption failed"

**Cause:** APP_KEY changed after credentials were encrypted

**Solution:**

```bash
# 1. Re-encrypt all credentials
php artisan flexxus:reset-credentials  # Clear all
php artisan flexxus:migrate-credentials  # Re-encrypt with new APP_KEY
```

### Issue: "Warehouse not found"

**Cause:** Attempting to use a warehouse ID that doesn't exist

**Solution:**

```bash
# List all warehouses
php artisan tinker
>>> Warehouse::all(['id', 'code', 'name'])
```

### Issue: "Invalid Flexxus credentials"

**Cause:** Wrong username/password for a specific warehouse

**Solution:**

```bash
# Clear credentials for that warehouse
php artisan flexxus:reset-credentials --warehouse=CENTRO

# Re-add correct credentials via Admin API
curl -X PUT http://localhost:8000/api/admin/warehouses/1/flexxus-credentials \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"flexxus_url":"https://...","flexxus_username":"...","flexxus_password":"..."}'
```

---

## Related Documentation

- [Admin Warehouse Management API](./warehouse-management-api.md)
- [Warehouse Override Mechanism](./warehouse-override-mechanism.md)
- [Flexxus Credentials Migration Guide](./flexxus-credentials-migration.md)
