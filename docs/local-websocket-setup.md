# Local WebSocket Development Setup

This guide covers setting up Laravel Reverb (WebSockets) for local development on Windows, Mac, or Linux.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Desktop/Mobile │ ──► │  Reverb WS   │ ──► │   Redis (Pub/Sub)│
│   (Echo Client) │     │  (Port 8080) │     │   (Port 6379)    │
└─────────────────┘     └──────────────┘     └──────────────────┘
                                ▲                        │
                                │                        ▼
                        ┌──────────────┐     ┌──────────────────┐
                        │  Laravel App │ ──► │  Broadcast Events│
                        │  (Port 8000) │     └──────────────────┘
                        └──────────────┘
```

**Components**:
- **Reverb**: Laravel's official WebSocket server (replaces `laravel-websockets`)
- **Redis**: Message broker for broadcasting events
- **Echo**: JavaScript client for Desktop/Mobile

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ / pnpm
- Redis server OR Docker (for Redis container)

---

## Phase 1: Install Redis

Choose ONE method below:

### Option A: Native Redis Installation (Recommended)

#### Windows (via Chocolatey)

```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Redis
choco install redis-64

# Start Redis service
redis-server

# Verify Redis is running (should respond with PONG)
redis-cli ping
```

#### macOS (via Homebrew)

```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Verify Redis is running
redis-cli ping
```

#### Linux (Ubuntu/Debian)

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server

# Enable Redis on boot
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
```

### Option B: Docker Compose (Fallback)

If you cannot install Redis natively, use Docker:

```bash
# From project root
docker-compose up -d redis

# Verify Redis is running
docker-compose exec redis redis-cli ping
```

**Note**: Docker Compose configuration is provided in `docker-compose.yml` at the project root.

---

## Phase 2: Configure Backend Environment

1. **Generate Reverb credentials** (if not already done):

```bash
cd flexxus-picking-backend
php artisan reverb:install
```

2. **Configure `.env` for local development**:

```env
# Broadcasting Configuration
BROADCAST_CONNECTION=reverb

# Reverb Configuration (Local Development)
REVERB_APP_ID=local
REVERB_APP_KEY=local-key
REVERB_APP_SECRET=local-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

# Redis Configuration
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

3. **Verify configuration**:

```bash
php artisan config:clear
php artisan config:cache
```

---

## Phase 3: Configure Desktop Environment

1. **Update `flexxus-picking-desktop/.env`**:

```env
# WebSocket Configuration (Local Development)
VITE_REVERB_APP_KEY=local-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

2. **Verify WebSocket proxy in `vite.config.ts`**:

```typescript
export default defineConfig({
  // ... existing config ...
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
})
```

---

## Phase 4: Configure Mobile Environment

1. **Update `flexxus-picking-mobile/app.json`**:

```json
{
  "expo": {
    "extra": {
      "websocketEnabled": true,
      "websocketHost": "localhost",
      "websocketPort": "8080",
      "pusherAppKey": "local-key"
    }
  }
}
```

2. **For real device testing** (not emulator):

```json
{
  "expo": {
    "extra": {
      "websocketEnabled": true,
      "websocketHost": "192.168.1.100", // Your computer's IP
      "websocketPort": "8080",
      "pusherAppKey": "local-key"
    }
  }
}
```

**Find your IP**:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr show`

---

## Phase 5: Start Development Servers

### Method A: Start All Services Manually

Open **4 separate terminals**:

**Terminal 1: Redis**
```bash
# Windows (if not running as service)
redis-server

# Mac (if not running as service)
brew services start redis

# Linux (if not running as service)
sudo systemctl start redis-server
```

**Terminal 2: Reverb WebSocket Server**
```bash
cd flexxus-picking-backend
php artisan reverb:start
```

**Expected output**:
```
INFO  Reverb server started.
INFO  Listening on http://0.0.0.0:8080
```

**Terminal 3: Laravel Backend**
```bash
cd flexxus-picking-backend
php artisan serve
```

**Expected output**:
```
INFO  Server running on [http://127.0.0.1:8000].
```

**Terminal 4: Desktop (or Mobile)**
```bash
# Desktop
cd flexxus-picking-desktop
pnpm dev

# Mobile (in another terminal)
cd flexxus-picking-mobile
npm start
```

### Method B: Using Laravel's Dev Script (Backend Only)

```bash
cd flexxus-picking-backend
composer run dev
```

This starts Laravel server, queue worker, logs, and Vite (if any) in parallel.
**Note**: You still need to start Redis and Reverb manually.

---

## Phase 6: Verify WebSocket Connection

### 1. Test Redis Connection

```bash
cd flexxus-picking-backend
php artisan tinker
>>> Redis::ping();
=> true
>>> exit
```

### 2. Test Reverb Server

Open your browser and navigate to:
```
http://localhost:8080
```

You should see a Reverb server status page or a blank page (no 404).

### 3. Test Desktop Connection

1. Start desktop app: `pnpm dev` in `flexxus-picking-desktop/`
2. Open browser DevTools (F12) → Console
3. Look for Echo connection logs:
   ```
   Echo: connecting to ws://localhost:8080
   Echo: connected
   ```
4. Login as admin/user
5. Check for subscription messages:
   ```
   Subscribed to private-warehouse.1
   ```

### 4. Test Mobile Connection (if testing mobile)

1. Start Expo: `npm start` in `flexxus-picking-mobile/`
2. Open app in emulator or device
3. Login as operario
4. Check React Native debugger logs for:
   ```
   Echo: connecting to ws://localhost:8080
   Echo: connected
   Subscribed to private-warehouse.1
   ```

---

## Phase 7: Test End-to-End Flow

### Backend Broadcast Test

```bash
cd flexxus-picking-backend
php artisan tinker
```

```php
// Test broadcast event
use App\Events\Broadcasting\OrderStartedBroadcastEvent;

event(new OrderStartedBroadcastEvent(
    orderNumber: 'TEST-001',
    warehouseId: 1,
    userId: 1,
    userName: 'Test User',
    message: 'Test broadcast'
));

exit
```

### Expected Results

**Desktop Console**:
```
Echo: received event order.started
Data: { event_type: 'order.started', order_number: 'TEST-001', ... }
Query invalidated: ["pending-orders", 1]
```

**Mobile Console** (if testing):
```
Echo: received event order.started
Data: { event_type: 'order.started', ... }
```

---

## Troubleshooting

### Issue: Redis connection refused

**Error**: `Connection refused [tcp://127.0.0.1:6379]`

**Solution**:
1. Verify Redis is running: `redis-cli ping` (should respond `PONG`)
2. Start Redis service (see Phase 1)
3. Check `.env` REDIS_HOST and REDIS_PORT

### Issue: Reverb won't start

**Error**: `Port 8080 already in use`

**Solution**:
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (Windows)
taskkill /PID <PID> /F

# OR change port in .env
REVERB_SERVER_PORT=8081
REVERB_PORT=8081
```

### Issue: Desktop won't connect to WebSocket

**Error**: `WebSocket connection to 'ws://localhost:8080' failed`

**Solution**:
1. Verify Reverb is running: `curl http://localhost:8080`
2. Check browser console for CORS errors
3. Verify `VITE_REVERB_*` vars in desktop `.env`
4. Check `allowed_origins` in `config/reverb.php` (should be `['*']` for local dev)

### Issue: Mobile can't connect (real device)

**Error**: `Network request failed` or timeout

**Solution**:
1. Use your computer's IP instead of `localhost` in `app.json`
2. Ensure device and computer are on the same network
3. Check firewall settings (port 8080 must be open)
4. Test with browser: `http://<YOUR_IP>:8080`

---

## Production Deployment (TODO)

For production, you'll need:

1. **Redis on production server**
   - Install Redis or use managed Redis (AWS ElastiCache, Redis Cloud)
   - Configure with password and secure settings

2. **Nginx reverse proxy for Reverb**
   - Terminates TLS (HTTPS/WSS)
   - Forwards to Reverb (ws://127.0.0.1:8080)

3. **Supervisor or systemd for Reverb**
   - Keep Reverb running automatically
   - Restart on failure

4. **Environment variables**
   ```env
   REVERB_SCHEME=https
   REVERB_HOST=your-domain.com
   REVERB_PORT=443
   ```

See `docs/deployment-checklist.md` for production deployment steps.

---

## Quick Reference Commands

```bash
# Start Redis
redis-server                                    # Windows/Mac/Linux
brew services start redis                       # Mac service
sudo systemctl start redis-server               # Linux service
docker-compose up -d redis                      # Docker

# Start Reverb
php artisan reverb:start

# Test Redis
redis-cli ping                                  # Should respond: PONG
php artisan tinker >>> Redis::ping();           # Should return: true

# Test Broadcast
php artisan tinker >>> event(new OrderStartedBroadcastEvent(...));

# Clear config cache
php artisan config:clear
php artisan config:cache
```

---

## Next Steps

After completing local setup:

1. ✅ **Phase 7 Complete**: Local environment is ready
2. ⏭️ **Phase 8**: Run local verification tests (see `docs/local-websocket-verification.md`)
3. ⏭️ **Test Batch E**: End-to-end flow testing
4. ⏭️ **Production**: Deploy to VPS with Redis + Nginx + Supervisor

---

## Additional Resources

- [Laravel Reverb Documentation](https://laravel.com/docs/reverb)
- [Laravel Broadcasting Documentation](https://laravel.com/docs/broadcasting)
- [Laravel Echo Documentation](https://github.com/laravel/echo)
- [Redis Documentation](https://redis.io/docs/)
