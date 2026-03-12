import { act, fireEvent, render, screen } from '@testing-library/react-native'

import type { PendingOrder } from '../../features/orders/types'
import { PendingOrdersScreen } from './PendingOrdersScreen'
import { useInfinitePendingOrders } from '../../features/orders/hooks'

const mockNavigate = jest.fn()

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}))

jest.mock('../../stores/auth-store', () => ({
  useAuthStore: (selector: (state: { user: unknown }) => unknown) =>
    selector({
      user: {
        warehouse: {
          id: 4,
          code: 'DEP-04',
          name: 'Deposito Norte',
        },
      },
    }),
}))

jest.mock('../../features/orders/hooks', () => {
  const actual = jest.requireActual('../../features/orders/hooks')

  return {
    ...actual,
    useInfinitePendingOrders: jest.fn(),
  }
})

const mockedUseInfinitePendingOrders = jest.mocked(useInfinitePendingOrders)

const firstOrder: PendingOrder = {
  orderType: 'NP',
  orderNumber: '100',
  customer: 'Cliente Uno',
  status: 'pending',
  assignedTo: { id: null, name: null },
  itemsCount: 4,
  itemsPicked: 1,
  createdAt: null,
  startedAt: null,
  warehouse: { id: 4, code: 'DEP-04', name: 'Deposito Norte' },
  total: 1200,
  deliveryType: 'retiro',
}

const secondOrder: PendingOrder = {
  ...firstOrder,
  orderNumber: '101',
  customer: 'Cliente Dos',
  status: 'in_progress',
}

function createQueryState() {
  return {
    data: {
      pages: [
        { data: [firstOrder], meta: { currentPage: 1, lastPage: 2, perPage: 20, total: 2 } },
        { data: [firstOrder, secondOrder], meta: { currentPage: 2, lastPage: 2, perPage: 20, total: 2 } },
      ],
    },
    isPending: false,
    isError: false,
    error: null,
    isFetching: false,
    isRefetching: false,
    isFetchingNextPage: false,
    hasNextPage: true,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  }
}

describe('PendingOrdersScreen', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    jest.useFakeTimers()
  })

  it('deduplicates merged pages and opens the selected order detail', () => {
    const queryState = createQueryState()
    mockedUseInfinitePendingOrders.mockReturnValue(queryState as never)

    render(<PendingOrdersScreen />)

    expect(screen.getAllByText('NP 100')).toHaveLength(1)
    expect(screen.getByText('NP 101')).toBeTruthy()

    fireEvent.press(screen.getByText('NP 101'))

    expect(mockNavigate).toHaveBeenCalledWith('OrderDetail', { orderNumber: 'NP-101' })

    fireEvent.press(screen.getByTestId('flash-list-end'))

    expect(queryState.fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('restarts the query with the debounced search term', () => {
    mockedUseInfinitePendingOrders.mockReturnValue(createQueryState() as never)

    render(<PendingOrdersScreen />)

    expect(mockedUseInfinitePendingOrders).toHaveBeenLastCalledWith('')

    fireEvent.changeText(screen.getByPlaceholderText('NP 623200 o cliente'), 'Acme')

    expect(mockedUseInfinitePendingOrders).toHaveBeenLastCalledWith('')

    act(() => {
      jest.advanceTimersByTime(350)
    })

    expect(mockedUseInfinitePendingOrders).toHaveBeenLastCalledWith('Acme')
  })
})
