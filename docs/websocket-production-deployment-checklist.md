# WebSocket Production Deployment Checklist

**Change**: implementar-websockets  
**Date**: 2026-03-19  
**Status**: Ready for Production Deployment

---

## Overview

This checklist guides the deployment of Laravel Reverb WebSocket server to production VPS. The implementation uses:
- **Laravel Reverb** (port 8080) as WebSocket server
- **Redis** as message broker
- **nginx** for WSS (WebSocket Secure) termination
- **Supervisor** for process management

---

## Pre-Deployment Checklist

### Prerequisites
- [ ] SSH access to production VPS
- [ ] Sudo privileges for package installation and service configuration
- [ ] Backup of current `.env` file
- [ ] Access to DNS management (if changing domains)
- [ ] SSL certificate installed (Let's Encrypt or commercial)

### Application Verification
- [ ] Backend code deployed to production (`git pull` or CI/CD completed)
- [ ] `composer.json` includes `laravel/reverb`
- [ ] `composer install` run on production server
- [ ] All migrations applied (`php artisan migrate`)

---

## Step 1: Install Redis

### Check if Redis is Already Installed
```bash
redis-cli --version
```

If installed (version 6.x+), skip to Step 2.

### Install Redis (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server -y
```

### Install Redis (CentOS/RHEL)
```bash
sudo yum install redis -y
```

### Start and Enable Redis Service
```bash
sudo systemctl start redis
sudo systemctl enable redis
```

### Verify Redis is Running
```bash
redis-cli ping
# Expected output: PONG
```

### Test Redis Connection
```bash
redis-cli info server
# Verify: redis_version, uptime, connected_clients
```

---

## Step 2: Configure Backend Environment Variables

### Edit Production `.env` File
```bash
cd /var/www/picking.app/flexxus-picking-backend
nano .env
```

### Add/Update These Variables
```env
# Broadcasting Configuration
BROADCAST_CONNECTION=redis

# Redis Configuration (existing)
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Laravel Reverb Configuration
REVERB_APP_ID=production
REVERB_APP_KEY=generate-a-random-32-char-key-here
REVERB_APP_SECRET=generate-a-random-32-char-secret-here
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=ws
REVERB_SERVER_HOST=0.0.0.0
```

### Generate Secure Keys
```bash
# Generate REVERB_APP_KEY (32 characters)
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32

# Generate REVERB_APP_SECRET (32 characters)
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
```

### Save and Exit
```
Ctrl+O (save), Enter, Ctrl+X (exit)
```

### Clear Configuration Cache
```bash
php artisan config:clear
php artisan cache:clear
```

---

## Step 3: Test Reverb Server (Manual Start)

### Start Reverb Manually (for testing)
```bash
cd /var/www/picking.app/flexxus-picking-backend
php artisan reverb:start
```

### Expected Output
```
INFO  Server running on [tcp://0.0.0.0:8080]
```

### Test Connection from Another Terminal
```bash
# Install wscat if not installed
sudo npm install -g wscat

# Connect to Reverb
wscat -c ws://localhost:8080
```

Expected: `Connected (press CTRL+C to quit)`

### Stop Manual Reverb
```
Ctrl+C
```

---

## Step 4: Configure Supervisor for Reverb

### Install Supervisor (if not installed)
```bash
sudo apt install supervisor -y
```

### Create Supervisor Configuration
```bash
sudo nano /etc/supervisor/conf.d/laravel-reverb.conf
```

### Add This Configuration
```ini
[program:laravel-reverb]
command=php /var/www/picking.app/flexxus-picking-backend/artisan reverb:start
directory=/var/www/picking.app/flexxus-picking-backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/reverb.log
stopwaitsecs=3600
```

### Save and Exit
```
Ctrl+O (save), Enter, Ctrl+X (exit)
```

### Reread and Update Supervisor
```bash
sudo supervisorctl reread
sudo supervisorctl update
```

### Start Reverb Service
```bash
sudo supervisorctl start laravel-reverb
```

### Verify Reverb is Running
```bash
sudo supervisorctl status laravel-reverb
# Expected output: laravel-reverb    RUNNING   pid 12345, uptime 0:00:05
```

### Check Reverb Logs
```bash
tail -f /var/log/reverb.log
# Should see: INFO  Server running on [tcp://0.0.0.0:8080]
```

---

## Step 5: Configure nginx for WSS (WebSocket Secure)

### Edit nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/picking.app
```

### Add WebSocket Location Block (inside SSL server block)
```nginx
# WebSocket Secure proxy
location /ws {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400; # 24 hours
}

# Existing API location
location /api {
    # ... your existing configuration ...
}
```

### Test nginx Configuration
```bash
sudo nginx -t
# Expected: syntax is ok, test is successful
```

### Reload nginx
```bash
sudo systemctl reload nginx
```

---

## Step 6: Configure Desktop Environment Variables

### Edit Desktop Environment (or build-time vars)
```bash
cd /var/www/picking.app/flexxus-picking-desktop
nano .env.production
```

### Add WebSocket Variables
```env
VITE_WEBSOCKET_HOST=wss://your-domain.com
VITE_WEBSOCKET_PORT=443
VITE_PUSHER_APP_KEY=your-production-app-key-from-reverb-env
VITE_ENABLE_WEBSOCKETS=true
```

### Rebuild Desktop (if needed)
```bash
pnpm build
```

---

## Step 7: Configure Mobile Environment Variables

### Edit `app.json` for Production Build
```bash
cd flexxus-picking-mobile
nano app.json
```

### Update WebSocket Configuration
```json
{
  "expo": {
    "name": "Flexxus Picking",
    "slug": "flexxus-picking",
    "extra": {
      "websocketEnabled": true,
      "websocketHost": "wss://your-domain.com",
      "websocketPort": 443,
      "pusherAppKey": "your-production-app-key-from-reverb-env"
    }
  }
}
```

### Rebuild Mobile App (EAS Build)
```bash
eas build --platform android --production
eas build --platform ios --production
```

---

## Step 8: Post-Deployment Verification

### 8.1 Verify Reverb Process
```bash
sudo supervisorctl status laravel-reverb
# Should be RUNNING
```

### 8.2 Verify nginx WSS Proxy
```bash
# From local machine, test WSS connection
wscat -c wss://your-domain.com/ws
# Expected: Connected (press CTRL+C to quit)
```

### 8.3 Verify Desktop Connection
1. Open desktop app in browser
2. Open Developer Console (F12)
3. Look for Echo connection logs:
   ```
   [Echo] connected
   [Echo] Channel: private-warehouse.{id} subscribed
   ```

### 8.4 Verify Mobile Connection
1. Open mobile app on device/emulator
2. Check React Native logs (via Expo CLI or Flipper)
3. Look for Echo connection logs

### 8.5 Test Real-Time Event Flow
**Scenario**: Operative starts an order, Admin sees it instantly

1. Login as operative on mobile app (warehouse_id = 1)
2. Note the current order count for admin
3. Operative: Start a new order
4. Admin: Verify order appears **within 500ms** (no refresh needed)

**Scenario**: Stock alert created, Operative receives it

1. Create a stock alert via API or admin panel
2. Verify operative sees alert toast **within 1 second**

### 8.6 Verify Cross-Warehouse Isolation
1. Login as admin for warehouse 1
2. Login as operative for warehouse 2
3. Operative (warehouse 2) starts an order
4. Admin (warehouse 1) should **NOT** see the order
5. Check browser console: No `order.started` event received

### 8.7 Test Reconnection
1. Reboot nginx: `sudo systemctl restart nginx`
2. Verify desktop/mobile apps reconnect automatically
3. Check logs for reconnection attempts with exponential backoff

---

## Step 9: Monitor and Troubleshoot

### Monitor Reverb Logs
```bash
tail -f /var/log/reverb.log
```

### Monitor nginx Access Logs
```bash
tail -f /var/log/nginx/access.log | grep /ws
```

### Monitor Redis Connections
```bash
redis-cli info clients
# Look for: connected_clients
```

### Common Issues and Fixes

#### Issue: Reverb won't start
**Check**:
```bash
sudo supervisorctl status laravel-reverb
tail -n 50 /var/log/reverb.log
```

**Fix**: Verify REVERB_* env vars, check port 8080 not in use

#### Issue: WSS connection fails
**Check**:
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Fix**: Verify nginx location block, restart nginx

#### Issue: Desktop not receiving events
**Check**: Browser console for errors

**Fix**: Verify VITE_WEBSOCKET_HOST is `wss://` (not `ws://`)

#### Issue: Mobile not receiving events
**Check**: React Native logs, app.json config

**Fix**: Verify `websocketEnabled: true`, rebuild app if needed

---

## Step 10: Production Monitoring (Post-Go-Live)

### Metrics to Monitor
- [ ] WebSocket connection count (should plateau at ~20)
- [ ] Event delivery latency (target: < 500ms for order updates)
- [ ] Reverb process uptime (should be 99%+)
- [ ] Redis memory usage
- [ ] nginx WebSocket connection errors

### Add Monitoring (Optional)
- **New Relic**: Install PHP agent for application performance monitoring
- **Datadog**: Use for infrastructure and log monitoring
- **Laravel Telescope**: Enable for debugging broadcast events

### Alerts to Configure
- [ ] Reverb process down (Supervisor)
- [ ] Redis connection failures
- [ ] High WebSocket error rate (nginx)
- [ ] Disk space (Reverb log file rotation)

---

## Rollback Plan

If critical issues occur, rollback to pre-WebSocket state:

### 1. Stop Reverb
```bash
sudo supervisorctl stop laravel-reverb
```

### 2. Disable WebSocket in Clients
```bash
# Desktop: Set flag
VITE_ENABLE_WEBSOCKETS=false

# Mobile: Rebuild with
"websocketEnabled": false
```

### 3. Apps Continue Working
- HTTP API remains functional
- Pull-to-refresh still available
- No data loss occurred

### 4. Investigate Logs
```bash
tail -n 100 /var/log/reverb.log
tail -n 100 /var/log/nginx/error.log
```

---

## Completion Checklist

- [ ] Redis installed and running
- [ ] Backend `.env` configured with REVERB_* variables
- [ ] Reverb server running via Supervisor
- [ ] nginx configured with WSS proxy
- [ ] Desktop environment variables set
- [ ] Mobile app.json configured and rebuilt
- [ ] WSS connection tested with wscat
- [ ] Desktop Echo connection verified
- [ ] Mobile Echo connection verified
- [ ] Real-time event flow tested (< 500ms)
- [ ] Cross-warehouse isolation verified
- [ ] Reconnection logic tested
- [ ] Monitoring and alerts configured

---

**Deployment Complete**: WebSocket real-time communication is now live in production! 🎉

For questions or issues, refer to:
- Archive report: `sdd/implementar-websockets/archive-report`
- Local setup guide: `docs/local-websocket-setup.md`
- Verification guide: `docs/local-websocket-verification.md`
