import { http, HttpResponse } from 'msw'

// Mock data
const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
}

const mockStats = {
  total_orders: 150,
  in_progress_count: 12,
  completed_count: 85,
  pending_count: 45,
  orders_with_issues: 8,
  by_warehouse: [
    {
      warehouse_id: 1,
      warehouse_code: 'CENTRO',
      warehouse_name: 'Centro',
      total_orders: 50,
      in_progress_count: 5,
      completed_count: 30,
      pending_count: 15,
    },
    {
      warehouse_id: 2,
      warehouse_code: 'NORTE',
      warehouse_name: 'Norte',
      total_orders: 100,
      in_progress_count: 7,
      completed_count: 55,
      pending_count: 30,
    },
  ],
}

const mockOrders = {
  data: [
    {
      id: 1,
      order_number: 'EXP-2026-00123',
      customer_name: 'Cliente ABC',
      status: 'in_progress',
      started_at: '2026-03-09T10:30:00Z',
      completed_at: null,
      warehouse: {
        id: 1,
        code: 'CENTRO',
        name: 'Centro',
      },
      assigned_to: {
        id: 5,
        name: 'Juan Pérez',
      },
      has_stock_issues: false,
      completed_percentage: 45,
      total_items: 10,
      picked_items: 4,
    },
    {
      id: 2,
      order_number: 'EXP-2026-00124',
      customer_name: 'Cliente XYZ',
      status: 'pending',
      started_at: null,
      completed_at: null,
      warehouse: {
        id: 2,
        code: 'NORTE',
        name: 'Norte',
      },
      assigned_to: null,
      has_stock_issues: false,
      completed_percentage: 0,
      total_items: 5,
      picked_items: 0,
    },
  ],
  meta: {
    current_page: 1,
    last_page: 5,
    per_page: 15,
    total: 100,
  },
}

const mockOrderDetail = {
  id: 1,
  order_number: 'EXP-2026-00123',
  customer_name: 'Cliente ABC',
  status: 'in_progress',
  started_at: '2026-03-09T10:30:00Z',
  completed_at: null,
  warehouse: {
    id: 1,
    code: 'CENTRO',
    name: 'Centro',
  },
  assigned_to: {
    id: 5,
    name: 'Juan Pérez',
  },
  has_stock_issues: false,
  completed_percentage: 45,
  total_items: 10,
  picked_items: 4,
  items: [
    {
      id: 1,
      product_code: 'PROD-001',
      product_name: 'Producto de prueba 1',
      quantity: 10,
      picked_quantity: 5,
      location: 'A-01-03',
      status: 'partial',
    },
    {
      id: 2,
      product_code: 'PROD-002',
      product_name: 'Producto de prueba 2',
      quantity: 5,
      picked_quantity: 5,
      location: 'A-02-01',
      status: 'picked',
    },
  ],
  alerts: [
    {
      id: 1,
      type: 'stock_issue',
      message: 'Stock insuficiente',
      severity: 'warning',
      created_at: '2026-03-09T11:00:00Z',
      resolved_at: null,
    },
  ],
}

export const handlers = [
  // Auth endpoints
  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: mockUser,
        token: 'mock-token-123',
      })
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('*/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  http.get('*/api/auth/me', () => {
    return HttpResponse.json({ user: mockUser })
  }),

  // Dashboard stats endpoint
  http.get('*/api/admin/stats', ({ request }) => {
    const url = new URL(request.url)
    const warehouseId = url.searchParams.get('warehouse_id')
    // Date filters available but not used in basic implementation
    // const dateFrom = url.searchParams.get('date_from')
    // const dateTo = url.searchParams.get('date_to')

    let filteredStats = { ...mockStats }

    if (warehouseId) {
      filteredStats.by_warehouse = filteredStats.by_warehouse.filter(
        (w) => w.warehouse_id === parseInt(warehouseId)
      )
    }

    return HttpResponse.json(filteredStats)
  }),

  // Orders list endpoint
  http.get('*/api/admin/orders', ({ request }) => {
    const url = new URL(request.url)
    const warehouseId = url.searchParams.get('warehouse_id')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('per_page') || '15')

    let filteredOrders = [...mockOrders.data]

    if (warehouseId) {
      filteredOrders = filteredOrders.filter((o) => o.warehouse.id === parseInt(warehouseId))
    }

    if (status) {
      filteredOrders = filteredOrders.filter((o) => o.status === status)
    }

    if (search) {
      filteredOrders = filteredOrders.filter((o) =>
        o.order_number.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Pagination
    const start = (page - 1) * perPage
    const paginatedData = filteredOrders.slice(start, start + perPage)

    return HttpResponse.json({
      data: paginatedData,
      meta: {
        current_page: page,
        last_page: Math.ceil(filteredOrders.length / perPage),
        per_page: perPage,
        total: filteredOrders.length,
      },
    })
  }),

  // Order detail endpoint
  http.get('*/api/admin/orders/:orderNumber', ({ params }) => {
    const { orderNumber } = params

    if (orderNumber === 'EXP-2026-00123') {
      return HttpResponse.json(mockOrderDetail)
    }

    return HttpResponse.json({ message: 'Order not found' }, { status: 404 })
  }),

  // Error simulation endpoints
  http.get('*/api/admin/error', () => {
    return HttpResponse.json({ message: 'Internal server error' }, { status: 500 })
  }),

  http.get('*/api/admin/unauthorized', () => {
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }),
]

// Note: For browser testing, create a worker in browser-specific test files
// For Node.js testing, use setupServer from 'msw/node' with these handlers
