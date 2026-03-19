# Local WebSocket Verification Checklist

This checklist verifies that the WebSocket implementation works end-to-end in local development.

**Prerequisites**: Complete `docs/local-websocket-setup.md` first.

---

## Phase 1: Infrastructure Verification

### 1.1 Redis Server

- [ ] Redis is installed
  ```bash
  redis-cli --version
  ```

- [ ] Redis is running
  ```bash
  redis-cli ping
  # Expected response: PONG
  ```

- [ ] Laravel can connect to Redis
  ```bash
  cd flexxus-picking-backend
  php artisan tinker
  >>> Redis::ping();
  # Expected response: true
  >>> exit
  ```

**Troubleshooting**:
- If Redis won't start: `redis-server` (or `brew services start redis` / `sudo systemctl start redis-server`)
- If connection fails: Check `.env` REDIS_HOST and REDIS_PORT

---

## Phase 2: Reverb Server Verification

### 2.1 Reverb Configuration

- [ ] Reverb is installed
  ```bash
  cd flexxus-picking-backend
  composer show laravel/reverb
  # Expected: laravel/reverb ^1.8
  ```

- [ ] Reverb credentials are configured in `.env`
  ```env
  REVERB_APP_ID=local
  REVERB_APP_KEY=local-key
  REVERB_APP_SECRET=local-secret
  REVERB_HOST=localhost
  REVERB_PORT=8080
  REVERB_SCHEME=http
  ```

- [ ] `config/broadcasting.php` has reverb connection
  ```bash
  php artisan config:cache
  php artisan tinker
  >>> config('broadcasting.default');
  # Expected response: "reverb"
  >>> exit
  ```

### 2.2 Reverb Server

- [ ] Reverb server starts
  ```bash
  cd flexxus-picking-backend
  php artisan reverb:start
  # Expected output:
  # INFO  Reverb server started.
  # INFO  Listening on http://0.0.0.0:8080
  ```

- [ ] Reverb server is accessible
  ```bash
  curl http://localhost:8080
  # Expected: HTTP 200 or blank page (not 404/Connection refused)
  ```

**Troubleshooting**:
- If port 8080 is in use: Change `REVERB_SERVER_PORT=8081` in `.env`
- If Reverb won't start: Check for other Reverb instances running

---

## Phase 3: Backend Broadcast Verification

### 3.1 Broadcast Events

- [ ] Broadcast events exist
  ```bash
  ls -la app/Events/Broadcasting/
  # Expected files:
  # - OrderStartedBroadcastEvent.php
  # - OrderCompletedBroadcastEvent.php
  # - PickingProgressBroadcastEvent.php
  # - StockAlertBroadcastEvent.php
  ```

- [ ] Broadcast events are dispatched from UseCases
  ```bash
  # Verify BroadcastingService is injected in UseCases
  grep -r "BroadcastingService" app/Services/Picking/UseCases/
  # Expected: Found in StartOrderUseCase, CompleteOrderUseCase, PickItemUseCase, CreateAlertUseCase
  ```

### 3.2 Channel Authorization

- [ ] Channel routes are defined
  ```bash
  cat routes/channels.php
  # Expected: 3 channels (warehouse, user, order)
  ```

- [ ] Channel authorization tests pass
  ```bash
  cd flexxus-picking-backend
  php artisan test --filter=ChannelAuthorizationTest
  # Expected: 12 passed
  ```

---

## Phase 4: Desktop Client Verification

### 4.1 Desktop Configuration

- [ ] WebSocket dependencies are installed
  ```bash
  cd flexxus-picking-desktop
  cat package.json | grep -E "(laravel-echo|socket.io)"
  # Expected:
  # "laravel-echo": "^1.16",
  # "socket.io-client": "^4.8"
  ```

- [ ] Desktop `.env` has WebSocket vars
  ```env
  VITE_REVERB_APP_KEY=local-key
  VITE_REVERB_HOST=localhost
  VITE_REVERB_PORT=8080
  VITE_REVERB_SCHEME=http
  ```

### 4.2 Desktop Connection

- [ ] Desktop app starts
  ```bash
  cd flexxus-picking-desktop
  pnpm dev
  # Expected: Vite server running on http://localhost:5173
  ```

- [ ] Echo client initializes
  - Open browser DevTools → Console
  - Login as admin
  - **Expected logs**:
    ```
    Echo: initializing...
    Echo: connecting to ws://localhost:8080
    Echo: connected
    ```

- [ ] Channel subscription works
  - **Expected logs**:
    ```
    Subscribing to private-warehouse.1
    Subscribed to private-warehouse.1
    ```

**Troubleshooting**:
- If Echo won't connect: Check VITE_REVERB_* vars in desktop `.env`
- If no logs: Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## Phase 5: Mobile Client Verification (Optional)

### 5.1 Mobile Configuration

- [ ] WebSocket dependencies are installed
  ```bash
  cd flexxus-picking-mobile
  cat package.json | grep -E "(laravel-echo|socket.io)"
  # Expected: laravel-echo and socket.io-client
  ```

- [ ] Mobile `app.json` has WebSocket vars
  ```json
  {
    "expo": {
      "extra": {
        "websocketEnabled": true,
        "websocketHost": "localhost",  // or "192.168.1.100" for real device
        "websocketPort": "8080",
        "pusherAppKey": "local-key"
      }
    }
  }
  ```

### 5.2 Mobile Connection

- [ ] Mobile app starts
  ```bash
  cd flexxus-picking-mobile
  npm start
  # Expected: Expo server running
  ```

- [ ] Echo client initializes in app
  - Open React Native Debugger (or check app logs)
  - Login as operario
  - **Expected logs**:
    ```
    Echo: connecting to ws://localhost:8080
    Echo: connected
    Subscribed to private-warehouse.1
    ```

**Troubleshooting**:
- If real device can't connect: Use your computer's IP instead of `localhost`
- If emulator can't connect: Check if `localhost` resolves to `10.0.2.2` (Android emulator)

---

## Phase 6: End-to-End Flow Verification

### 6.1 Test Broadcast Event from Backend

```bash
cd flexxus-picking-backend
php artisan tinker
```

```php
// Test OrderStartedBroadcastEvent
use App\Events\Broadcasting\OrderStartedBroadcastEvent;

event(new OrderStartedBroadcastEvent(
    orderNumber: 'TEST-001',
    warehouseId: 1,
    userId: 1,
    userName: 'Test User',
    message: 'Test broadcast from tinker'
));

exit
```

**Expected Desktop Console**:
```
Echo: received event .order.started
Data: {
  event_type: "order.started",
  order_number: "TEST-001",
  warehouse_id: 1,
  user_id: 1,
  user_name: "Test User",
  message: "Test broadcast from tinker",
  timestamp: "2026-03-19T18:00:00.000000Z"
}

Invalidating queries: ["pending-orders", 1]
Invalidating queries: ["dashboard-stats"]
```

**Expected Mobile Console** (if testing mobile):
```
Echo: received event .order.started
Data: { ... }
Invalidating queries: ["pending-orders", 1]
```

### 6.2 Test Real Use Case (Full Flow)

**Desktop (Admin View)**:
1. Open desktop app at `http://localhost:5173`
2. Login as admin (warehouse 1)
3. Navigate to pending orders page
4. Note the current list of orders

**Backend (Create Test Order)**:
```bash
cd flexxus-picking-backend
php artisan tinker
```

```php
// Create a test picking order
use App\Models\PickingOrderProgress;
use App\Services\Picking\PickingService;
use App\Services\Broadcasting\BroadcastingService;

$broadcasting = app(BroadcastingService::class);
$pickingService = new PickingService($broadcasting);

// Start an order
$order = $pickingService->startOrder(
    orderId: 999,
    warehouseId: 1,
    userId: 1,
    userName: 'Test User'
);

echo "Order started: {$order->order_number}\n";
exit
```

**Expected Desktop Behavior**:
- Desktop app **automatically updates** within 500ms
- New order appears in pending orders list
- Console shows WebSocket event received
- No page refresh needed

**Mobile (Operario View)** - if testing mobile:
1. Open mobile app
2. Login as operario (same warehouse)
3. Mobile app **automatically updates** with new order
4. Notification shows (if implemented)

---

## Phase 7: Reconnection Testing

### 7.1 Test Redis Reconnection

1. Start all services (Redis, Reverb, Laravel, Desktop)
2. Verify Desktop is connected
3. **Stop Redis**:
   ```bash
   # Windows: Ctrl+C in Redis terminal
   # Mac: brew services stop redis
   # Linux: sudo systemctl stop redis-server
   ```
4. **Expected Desktop Console**:
   ```
   Echo: disconnected
   Echo: reconnecting in 1s...
   Echo: reconnecting in 2s...
   ```
5. **Start Redis again**:
   ```bash
   # Windows: redis-server
   # Mac: brew services start redis
   # Linux: sudo systemctl start redis-server
   ```
6. **Expected Desktop Console**:
   ```
   Echo: reconnected
   Echo: connected
   ```

### 7.2 Test Reverb Reconnection

1. Stop Reverb server (Ctrl+C)
2. **Expected Desktop Console**: `Echo: disconnected`
3. Start Reverb again: `php artisan reverb:start`
4. **Expected Desktop Console**: `Echo: reconnected`

---

## Phase 8: Channel Authorization Testing

### 8.1 Test Warehouse Isolation

- [ ] Admin of warehouse 1 CANNOT see warehouse 2 events
  ```bash
  cd flexxus-picking-backend
  php artisan tinker
  ```
  ```php
  // Broadcast to warehouse 2
  event(new OrderStartedBroadcastEvent(
      orderNumber: 'TEST-002',
      warehouseId: 2,  // Different warehouse
      userId: 2,
      userName: 'User 2',
      message: 'Warehouse 2 event'
  ));
  exit
  ```

**Expected Desktop (admin of warehouse 1)**:
- **NO** event received
- Console shows no broadcast logs
- Query invalidation does NOT happen

### 8.2 Test User Channel Isolation

- [ ] User 1 CANNOT see user 2's events
  ```bash
  php artisan tinker
  ```
  ```php
  use App\Events\Broadcasting\StockAlertBroadcastEvent;

  event(new StockAlertBroadcastEvent(
      warehouseId: 1,
      userId: 2,  // Different user
      alertId: 999,
      sku: 'TEST-SKU',
      message: 'User 2 alert'
  ));
  exit
  ```

**Expected Desktop (logged in as user 1)**:
- **NO** event received
- No alert notification

---

## Phase 9: Unit & Integration Tests

### 9.1 Backend Tests

- [ ] Broadcast event unit tests pass
  ```bash
  cd flexxus-picking-backend
  php artisan test --filter=BroadcastEventsTest
  # Expected: 14 passed
  ```

- [ ] Channel authorization tests pass
  ```bash
  php artisan test --filter=ChannelAuthorizationTest
  # Expected: 12 passed
  ```

- [ ] No regressions in existing tests
  ```bash
  php artisan test --filter="PickingServiceTest"
  # Expected: All existing tests still pass
  ```

### 9.2 Desktop Tests

- [ ] Echo client tests pass
  ```bash
  cd flexxus-picking-desktop
  pnpm test src/lib/echo.test.ts
  # Expected: 6 passed
  ```

- [ ] WebSocket hook tests pass
  ```bash
  pnpm test src/hooks/use-websocket.test.ts
  # Expected: 9 passed
  ```

### 9.3 Mobile Tests (Optional)

- [ ] Echo client tests pass
  ```bash
  cd flexxus-picking-mobile
  npm test src/lib/echo.test.ts
  # Expected: 12 passed
  ```

- [ ] WebSocket hook tests pass
  ```bash
  npm test src/hooks/use-websocket.test.ts
  # Expected: 20+ passed
  ```

---

## Phase 10: Performance & Reliability

### 10.1 Latency Test

1. Open Desktop DevTools → Performance tab
2. Start recording
3. Trigger broadcast event from backend (tinker)
4. Stop recording
5. Measure time from broadcast to UI update

**Expected**: < 500ms end-to-end latency

### 10.2 Memory Leak Test

1. Open Desktop DevTools → Memory tab
2. Take heap snapshot
3. Connect/disconnect WebSocket 10 times
4. Take another heap snapshot
5. Compare snapshots

**Expected**: No significant memory increase

### 10.3 Concurrent Connections Test

1. Open Desktop in 3 different browsers/windows
2. Login as same user in all windows
3. Trigger broadcast event

**Expected**: All 3 windows receive event simultaneously

---

## Verification Summary

### ✅ All Checks Passed

**Congratulations!** Your WebSocket implementation is working correctly locally.

**Next steps**:
- Deploy to production (see `docs/deployment-checklist.md`)
- Set up monitoring and alerting
- Document any production-specific configuration

### ⚠️ Some Checks Failed

**Common issues**:

1. **Redis not running**: Start Redis service (see `docs/local-websocket-setup.md`)
2. **Reverb won't start**: Check port 8080 availability, change port in `.env`
3. **Desktop won't connect**: Verify `VITE_REVERB_*` vars in desktop `.env`
4. **No events received**: Check browser console for errors, verify channel authorization
5. **Tests failing**: Run tests individually to identify specific issues

**Debug commands**:
```bash
# Check Laravel logs
cd flexxus-picking-backend
tail -f storage/logs/laravel.log

# Check Reverb logs (when started with --verbose)
php artisan reverb:start --verbose

# Test Redis connection
redis-cli monitor

# Check broadcast events are being dispatched
php artisan tinker
>>> use Illuminate\Support\Facades\Event;
>>> Event::listen('*', function ($event, $data) { var_dump($event); });
>>> event(new OrderStartedBroadcastEvent(...));
```

---

## Sign-off

**Date**: _______________

**Verified by**: _______________

**Environment**:
- OS: [Windows/Mac/Linux]
- PHP: ___
- Laravel: ___
- Redis: [Installed/Not Installed]
- Reverb: [Running/Not Running]

**Results**:
- [ ] Phase 1: Infrastructure ✅
- [ ] Phase 2: Reverb ✅
- [ ] Phase 3: Backend ✅
- [ ] Phase 4: Desktop ✅
- [ ] Phase 5: Mobile (optional) ✅
- [ ] Phase 6: E2E Flow ✅
- [ ] Phase 7: Reconnection ✅
- [ ] Phase 8: Auth Isolation ✅
- [ ] Phase 9: Tests ✅
- [ ] Phase 10: Performance ✅

**Overall Status**: [ ] PASSED / [ ] FAILED

**Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________
