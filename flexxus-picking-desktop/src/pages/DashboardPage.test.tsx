import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardPage } from '@/pages/DashboardPage'
import { useStats } from '@/hooks/use-stats'
import { toast } from '@/hooks/use-toast'

// Mock dependencies
vi.mock('@/hooks/use-stats')
vi.mock('@/hooks/use-toast')

// Mock dashboard components that have complex dependencies
vi.mock('@/components/dashboard/WarehouseSelector', () => ({
  WarehouseSelector: ({ className }: { className?: string }) => (
    <div className={className} data-testid="warehouse-selector">
      Warehouse Selector Mock
    </div>
  ),
}))

vi.mock('@/contexts/WarehouseFilterContext', () => ({
  useWarehouseFilterStore: vi.fn((selector) => {
    const state = {
      selectedWarehouseId: null,
      setSelectedWarehouseId: vi.fn(),
      clearFilter: vi.fn(),
    }
    return selector ? selector(state) : state
  }),
}))

describe('DashboardPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    vi.clearAllMocks()

    // Default useStats mock
    vi.mocked(useStats).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    // Default toast mock
    vi.mocked(toast).mockReturnValue({
      id: '1',
      dismiss: vi.fn(),
      update: vi.fn(),
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )

  it('should render dashboard title', () => {
    render(<DashboardPage />, { wrapper })

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Resumen de operaciones del picking')
    ).toBeInTheDocument()
  })

  it('should render loading skeletons while fetching stats', () => {
    vi.mocked(useStats).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(<DashboardPage />, { wrapper })

    // Should show 4 stat cards with skeletons
    const skeletons = screen.getAllByText(/Total Pedidos|En Proceso|Completados|Pendientes/)
    expect(skeletons).toHaveLength(4)
  })

  it('should render stats cards with data', async () => {
    const mockStats = {
      total_orders: 100,
      in_progress_count: 20,
      completed_count: 60,
      by_warehouse: [
        {
          warehouse_id: 1,
          warehouse_code: 'CENTRO',
          warehouse_name: 'Centro',
          total_orders: 50,
          in_progress_count: 10,
          completed_count: 30,
        },
      ],
    }

    vi.mocked(useStats).mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument() // Total
      expect(screen.getByText('20')).toBeInTheDocument() // In progress
      expect(screen.getByText('60')).toBeInTheDocument() // Completed
      expect(screen.getByText('20')).toBeInTheDocument() // Pending (100 - 60 - 20)
    })
  })

  it('should render error state when API fails', () => {
    const mockError = new Error('Failed to fetch')

    vi.mocked(useStats).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn(),
    } as any)

    render(<DashboardPage />, { wrapper })

    expect(screen.getByText(/Error al cargar las estadísticas/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument()
  })

  it('should call refetch when retry button is clicked', async () => {
    const mockError = new Error('Failed to fetch')
    const mockRefetch = vi.fn()

    vi.mocked(useStats).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: mockRefetch,
    } as any)

    const user = userEvent.setup()
    render(<DashboardPage />, { wrapper })

    const retryButton = screen.getByRole('button', { name: /Reintentar/i })
    await user.click(retryButton)

    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it('should call refetch and show toast when refresh button is clicked', async () => {
    const mockRefetch = vi.fn()
    const mockToast = vi.fn()

    vi.mocked(useStats).mockReturnValue({
      data: {
        total_orders: 100,
        in_progress_count: 20,
        completed_count: 60,
        by_warehouse: [],
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any)

    vi.mocked(toast).mockReturnValue({
      id: '1',
      dismiss: vi.fn(),
      update: vi.fn(),
    })

    render(<DashboardPage />, { wrapper })

    const user = userEvent.setup()
    const refreshButton = screen.getByRole('button', { name: /Actualizar/i })
    await user.click(refreshButton)

    expect(mockRefetch).toHaveBeenCalledTimes(1)
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Actualizando...',
      description: 'Las estadísticas se están actualizando',
    })
  })

  it('should render warehouse stats breakdown', async () => {
    const mockStats = {
      total_orders: 100,
      in_progress_count: 20,
      completed_count: 60,
      by_warehouse: [
        {
          warehouse_id: 1,
          warehouse_code: 'CENTRO',
          warehouse_name: 'Centro',
          total_orders: 50,
          in_progress_count: 10,
          completed_count: 30,
        },
        {
          warehouse_id: 2,
          warehouse_code: 'NORTE',
          warehouse_name: 'Norte',
          total_orders: 50,
          in_progress_count: 10,
          completed_count: 30,
        },
      ],
    }

    vi.mocked(useStats).mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    render(<DashboardPage />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Estadísticas por Depósito')).toBeInTheDocument()
      expect(screen.getByText('Centro')).toBeInTheDocument()
      expect(screen.getByText('Norte')).toBeInTheDocument()
      expect(screen.getByText('CENTRO')).toBeInTheDocument()
      expect(screen.getByText('NORTE')).toBeInTheDocument()
    })
  })

  it('should update date range filters', async () => {
    const mockStats = {
      total_orders: 100,
      in_progress_count: 20,
      completed_count: 60,
      by_warehouse: [],
    }

    vi.mocked(useStats).mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    const user = userEvent.setup()
    render(<DashboardPage />, { wrapper })

    const dateFromInput = screen.getByLabelText('Desde')
    const dateToInput = screen.getByLabelText('Hasta')

    await user.type(dateFromInput, '2026-03-01')
    await user.type(dateToInput, '2026-03-09')

    expect(dateFromInput).toHaveValue('2026-03-01')
    expect(dateToInput).toHaveValue('2026-03-09')
  })
})
