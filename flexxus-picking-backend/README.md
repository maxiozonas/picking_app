# Flexxus Picking Backend

Backend API Laravel para aplicación de armado de pedidos.

## Stack
- Laravel 12
- MySQL (XAMPP)
- Laravel Sanctum (API auth)
- Service Layer Pattern
- Guzzle HTTP (Flexxus integration)

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
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8000,localhost:19000,localhost:19001,127.0.0.1:8000
FLEXXUS_API_URL=https://apiapp.flexxus.com.ar/v2
```

## Credenciales de Prueba

**Admin:**
- Username: `admin`
- Password: `password`
- Permisos: Override de depósito habilitado
- Depósito: DEPO-CEN (con acceso a todos)

**Operador:**
- Username: `operario1`
- Password: `password`
- Permisos: Solo depósito asignado
- Depósito: DEPO-CEN

## API Endpoints

Ver documentación completa: [docs/api-auth.md](docs/api-auth.md)

### Endpoints Principales
- `POST /api/auth/login` - Autenticación
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/override-warehouse` - Cambiar depósito temporalmente
- `POST /api/auth/clear-override` - Eliminar override de depósito

## Arquitectura

El proyecto sigue el patrón **Service Layer** para separar la lógica de negocio de los controladores:

```
app/
├── Http/
│   ├── Controllers/Api/    # Endpoints HTTP (delgados)
│   ├── Requests/            # Validación de requests
│   └── Resources/           # Transformación de respuestas
├── Services/
│   └── Auth/                # Lógica de negocio
│       ├── AuthService.php           # Implementación
│       └── AuthServiceInterface.php  # Contrato
├── Repositories/
│   └── Auth/                # Acceso a datos
│       ├── AuthRepository.php           # Implementación
│       └── AuthRepositoryInterface.php  # Contrato
└── Models/                  # Modelos Eloquent con relationships
```

**Flujo de Request:**
1. **Controller** recibe request HTTP
2. **Request** valida datos
3. **Service** ejecuta lógica de negocio
4. **Repository** accede a datos
5. **Resource** transforma respuesta

## Desarrollo

```bash
php artisan migrate:fresh --seed  # Reset DB con datos de prueba
php artisan serve                 # Servidor de desarrollo
php artisan test                   # Ejecutar tests
php artisan db:seed               # Reseedear datos de prueba
```

## Datos de Prueba (Seeders)

**Warehouses:**
- DEPO-CEN: Depósito Central (default)
- DEPO-NOR: Depósito Norte
- DEPO-SUR: Depósito Sur

**Usuarios:**
- Admin: Puede hacer override a cualquier depósito
- Operario: Solo puede usar su depósito asignado
