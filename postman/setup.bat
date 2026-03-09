@echo off
REM Script de preparación para testing con Postman (Windows)
REM Uso: setup.bat

echo 🚀 Preparando entorno para testing con Postman...
echo.

REM 1. Limpiar y recrear BD
echo 📊 Paso 1: Migraciones fresh con seeders...
cd flexxus-picking-backend
php artisan migrate:fresh --seed

echo.
echo ✅ Migraciones completadas
echo.

REM 2. Diagnóstico
echo 🔍 Paso 2: Ejecutando diagnóstico del sistema...
echo.
php artisan diagnose:users

echo.
echo ✅ Diagnóstico completado - Verifica arriba qué usuarios y warehouses existen
echo.

REM 3. Verificar warehouses creados
echo 📦 Paso 3: Verificando warehouses...
php artisan db:table warehouses --columns=id,code,name,flexxus_username

echo.
echo ✅ Verificación de warehouses completada
echo.

REM 4. Verificar usuarios creados
echo 👤 Paso 4: Verificando usuarios...
php artisan db:table users --columns=id,username,role,warehouse_id,is_active

echo.
echo ✅ Verificación de usuarios completada
echo.

REM 5. Iniciar servidor
echo 🌐 Paso 5: Iniciando servidor de desarrollo...
echo.
echo Servidor iniciando en http://localhost:8000
echo Presiona Ctrl+C para detener
echo.
php artisan serve

echo.
echo ✅ Entorno listo para testing con Postman!
echo.
echo 📋 Credenciales de prueba:
echo    Admin:
echo      Username: admin
echo      Password: password
echo.
echo    Operario Rondeau (codigo 002):
echo      Username: operador_rondeau
echo      Password: password
echo.
echo    Operario Don Bosco (codigo 001):
echo      Username: operador_donbosco
echo      Password: password
echo.
echo 💡 IMPORTANTE: Si login falla, verifica TROUBLESHOOTING.md
echo.

pause
