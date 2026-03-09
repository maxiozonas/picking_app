# flexxus-picking-desktop

Aplicación web desktop para administradores del sistema de picking de órdenes.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand (UI) + TanStack Query (Server)
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Testing:** Vitest + React Testing Library

## Prerequisites

- Node.js 20+
- pnpm 8+

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update `VITE_API_URL` to point to your Laravel backend:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Run development server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### 4. Build for production

```bash
pnpm build
```

### 5. Preview production build

```bash
pnpm preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (Header, Sidebar)
│   ├── dashboard/       # Dashboard-specific components
│   └── orders/          # Orders-specific components
├── pages/               # Route pages
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores (auth, UI state)
├── lib/                 # Utilities (API client, helpers)
├── types/               # TypeScript type definitions
└── test/                # Test setup and utilities
```

## Available Scripts

| Script               | Description              |
| -------------------- | ------------------------ |
| `pnpm dev`           | Start development server |
| `pnpm build`         | Build for production     |
| `pnpm preview`       | Preview production build |
| `pnpm lint`          | Run ESLint               |
| `pnpm test`          | Run tests                |
| `pnpm test:coverage` | Run tests with coverage  |

## Environment Variables

| Variable                | Description                          | Default                     |
| ----------------------- | ------------------------------------ | --------------------------- |
| `VITE_API_URL`          | Laravel API base URL                 | `http://localhost:8000/api` |
| `VITE_ENABLE_POLLING`   | Enable polling for real-time updates | `true`                      |
| `VITE_POLLING_INTERVAL` | Polling interval in milliseconds     | `30000`                     |

## Authentication

The app uses Laravel Sanctum token-based authentication:

1. Login via `/api/auth/login` → receives token
2. Token stored in localStorage
3. Axios interceptor adds `Authorization: Bearer {token}` to requests
4. 401 responses trigger automatic logout

## Features

- 🔐 Admin authentication
- 📊 Dashboard con estadísticas
- 📦 Lista de pedidos (todos los warehouses)
- ⏳ Pedidos en progreso
- 👥 Vista de empleados y tareas asignadas
- 🔍 Filtros por warehouse y rango de fechas
- 🔄 Actualización automática (polling)

## API Integration

The desktop app connects to the Laravel backend API:

- Authentication: `/api/auth/*`
- Admin endpoints: `/api/admin/*`
- All requests include auth token via interceptors

## Code Quality

- **Linting:** ESLint with TypeScript rules
- **Formatting:** Prettier with Tailwind plugin
- **Testing:** Vitest + React Testing Library

Before committing:

```bash
pnpm lint
pnpm test
```

## Deployment

1. Build the app: `pnpm build`
2. Deploy the `dist/` folder to your web server
3. Configure `VITE_API_URL` for production

## License

Proprietary - Flexxus Picking System
