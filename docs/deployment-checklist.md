# Deployment Checklist: Warehouse Flexxus Credentials

**Change**: warehouse-flexxus-credentials
**Date**: 2026-03-09
**Target**: Production Migration

---

## Pre-Deployment Checklist

### 1. Database Preparation

- [ ] **Backup production database**
  ```bash
  php artisan db:backup
  ```
  
- [ ] **Verify Flexxus credentials migration has been run**
  ```bash
  php artisan migrate:status | grep flexxus_credentials
  ```
  
- [ ] **Verify encrypted casts are working in staging**
  - Check `warehouses` table has `flexxus_url`, `flexxus_username`, `flexxus_password` columns
  - Verify data is encrypted (not plain text)

### 2. Credential Verification

- [ ] **Test Flexxus credentials for all warehouses**
  
  **Warehouse 002 (Rondeau)**:
  - Username: `PREPR`
  - Password: `1234`
  - Test login at Flexxus portal
  
  **Warehouse 001 (Don Bosco)**:
  - Username: `PREPDB`
  - Password: `1234`
  - Test login at Flexxus portal
  
  **Warehouse 004 (Socrates)**:
  - Username: `PREPVM`
  - Password: `1234`
  - Test login at Flexxus portal

- [ ] **Verify warehouse codes match exactly**
  - 002 = RONDEAU
  - 001 = DON BOSCO
  - 004 = SOCRATES

### 3. Code Deployment

- [ ] **Deploy to staging first**
  ```bash
  git pull origin main
  composer install --no-dev
  php artisan migrate
  php artisan db:seed --class=FlexxusCredentialsSeeder
  ```
  
- [ ] **Run test suite in staging**
  ```bash
  php artisan test
  ```

- [ ] **Verify credentials seeded in staging**
  ```bash
  php artisan tinker --execute="App\Models\Warehouse::whereIn('code', ['001', '002', '004'])->get(['code', 'name'])"
  ```

### 4. Security Verification

- [ ] **Verify APP_KEY is the same across all environments**
  - **CRITICAL**: If APP_KEY changes, encrypted credentials become corrupt
  - Run: `php artisan key:show` and compare with production

- [ ] **Verify no credentials in .env**
  - Remove or comment out:
    - `FLEXXUS_USERNAME`
    - `FLEXXUS_PASSWORD`
  - Keep `FLEXXUS_URL` for fallback (optional)

- [ ] **Verify encrypted credentials in database**
  ```sql
  SELECT code, flexxus_username FROM warehouses WHERE code IN ('001', '002', '004');
  ```
  - Output should NOT show plain text `PREPR`, `PREPDB`, `PREPVM`
  - Output should be encrypted strings

---

## Production Deployment Steps

### Step 1: Maintenance Mode (Optional)

```bash
php artisan down
```

### Step 2: Deploy Code

```bash
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Step 3: Run Migrations

```bash
php artisan migrate --force
```

### Step 4: Seed Credentials

```bash
php artisan db:seed --class=FlexxusCredentialsSeeder --force
```

### Step 5: Verify Seeded Credentials

```bash
php artisan tinker --execute="
echo json_encode(
    Illuminate\Support\Facades\DB::table('warehouses')
        ->whereIn('code', ['001', '002', '004'])
        ->select('code', 'name', 'has_flexxus_credentials')
        ->get(), 
    JSON_PRETTY_PRINT
);"
```

Expected output:
```json
[
    {
        "code": "001",
        "name": "DON BOSCO",
        "has_flexxus_credentials": "✓"
    },
    {
        "code": "002",
        "name": "RONDEAU",
        "has_flexxus_credentials": "✓"
    },
    {
        "code": "004",
        "name": "SOCRATES",
        "has_flexxus_credentials": "✓"
    }
]
```

### Step 6: Clear Caches

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize:clear
```

### Step 7: Bring Application Up

```bash
php artisan up
```

---

## Post-Deployment Verification

### 1. Smoke Tests

- [ ] **Test operator login**
  - Login as employee from warehouse 002
  - Verify picking orders load
  - Verify stock validation works

- [ ] **Test admin credential management**
  - Login as admin
  - Check warehouse list at `/api/admin/warehouses`
  - Verify credentials are NOT exposed in JSON

- [ ] **Test Flexxus authentication**
  - Verify Flexxus API calls work
  - Check logs for authentication errors

### 2. Security Verification

- [ ] **Check logs for credential exposure**
  ```bash
  tail -f storage/logs/laravel.log | grep -i "password\|username"
  ```
  - Should NOT see plain text credentials

- [ ] **Test credential redaction**
  - Check `/api/admin/warehouses` response
  - Verify `flexxus_username`, `flexxus_password`, `flexxus_url` are NOT present

### 3. Performance Verification

- [ ] **Check response times**
  - Picking orders endpoint should not be slower than before
  - Flexxus API calls should still be cached

- [ ] **Check error rates**
  - No new errors in logs
  - No spikes in Flexxus authentication failures

---

## Rollback Plan

If deployment fails:

1. **Rollback code**
   ```bash
   git checkout <previous-stable-tag>
   composer install
   ```

2. **Rollback database** (if needed)
   ```bash
   php artisan migrate:rollback --step=1
   ```

3. **Restore credentials from backup**
   - If you backed up the `warehouses` table before seeding:
   ```bash
   php artisan db:restore --table=warehouses --file=warehouses_backup.sql
   ```

4. **Clear caches and bring up**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan up
   ```

---

## Troubleshooting

### Issue: Credentials not decrypting

**Symptom**: `flexxus_username` returns encrypted string instead of plain text

**Cause**: APP_KEY changed between encryption and decryption

**Solution**:
1. Re-run credential seeder with correct APP_KEY
2. Or restore from backup where APP_KEY was same

### Issue: Flexxus authentication fails

**Symptom**: 401 errors from Flexxus API

**Cause**: Wrong credentials or Flexxus URL

**Solution**:
1. Test credentials manually at Flexxus portal
2. Verify `FLEXXUS_URL` config is correct
3. Check Flexxus API status

### Issue: Warehouse not found

**Symptom**: `Warehouse not found` errors

**Cause**: Warehouse code doesn't match

**Solution**:
1. Verify warehouse codes: `001`, `002`, `004`
2. Check warehouses exist in database
3. Re-run seeder if missing

---

## Contact Information

- **Technical Lead**: [Name]
- **Flexxus Support**: [Contact]
- **On-Call Engineer**: [Phone]

---

## Appendices

### A. Warehouse Credential Mapping

| Code | Name | Username | Password |
|------|------|----------|----------|
| 002 | RONDEAU | PREPR | •••••• |
| 001 | DON BOSCO | PREPDB | •••••• |
| 004 | SOCRATES | PREPVM | •••••• |

### B. Related Documentation

- [Multi-Account Flexxus Migration Guide](../../docs/flexxus-multi-account-migration.md)
- [AGENTS.md - Testing Commands](../../AGENTS.md)
- [Error Codes Reference](../../docs/error-codes.md)

---

**Last Updated**: 2026-03-09
**Version**: 1.0.0
**Status**: READY FOR DEPLOYMENT
