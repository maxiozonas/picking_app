import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'

import { OrderDetailScreen } from './OrderDetailScreen'
import {
  useCompleteOrderMutation,
  useOrderDetail,
  useOrderStockValidations,
  usePickItemMutation,
  useStartOrderMutation,
} from '../../features/picking/hooks'
import { useCreateAlertMutation } from '../../features/alerts/hooks'
import type { OrderDetail } from '../../features/picking/types'

const mockGoBack = jest.fn()

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({ params: { orderNumber: 'NP-100' } }),
}))

jest.mock('../../features/orders/components/OrderProgressHeader', () => ({
  OrderProgressHeader: () => {
    const React = require('react')
    const { Text } = require('react-native')

    return React.createElement(Text, null, 'Progress header')
  },
}))

jest.mock('../../features/picking/components/PickItemCard', () => ({
  PickItemCard: ({ item, onPick, onReportAlert }: { item: { productCode: string }; onPick: (item: { productCode: string }, quantity: number) => void; onReportAlert: (item: { productCode: string }) => void }) => {
    const React = require('react')
    const { Text, View } = require('react-native')

    return React.createElement(
      View,
      null,
      React.createElement(Text, null, item.productCode),
      React.createElement(Text, { onPress: () => onPick(item, 1) }, `pick ${item.productCode}`),
      React.createElement(Text, { onPress: () => onReportAlert(item) }, `alert ${item.productCode}`),
    )
  },
}))

jest.mock('../../features/alerts/components/AlertComposerSheet', () => ({
  AlertComposerSheet: ({ visible, selectedProductCode, onSubmit }: { visible: boolean; selectedProductCode?: string | null; onSubmit: (input: { alertType: 'order_issue'; severity: 'medium'; message: string; productCode?: string | null }) => void }) => {
    const React = require('react')
    const { Text, View } = require('react-native')

    if (!visible) {
      return null
    }

    return React.createElement(
      View,
      null,
      React.createElement(Text, null, `Composer ${selectedProductCode ?? 'pedido'}`),
      React.createElement(
        Text,
        { onPress: () => onSubmit({ alertType: 'order_issue', severity: 'medium', message: 'Incidencia reportada', productCode: selectedProductCode }) },
        'enviar alerta mock',
      ),
    )
  },
}))

jest.mock('../../features/picking/hooks', () => ({
  useOrderDetail: jest.fn(),
  useOrderStockValidations: jest.fn(),
  useStartOrderMutation: jest.fn(),
  usePickItemMutation: jest.fn(),
  useCompleteOrderMutation: jest.fn(),
}))

jest.mock('../../features/alerts/hooks', () => ({
  useCreateAlertMutation: jest.fn(),
}))

const mockedUseOrderDetail = jest.mocked(useOrderDetail)
const mockedUseOrderStockValidations = jest.mocked(useOrderStockValidations)
const mockedUseStartOrderMutation = jest.mocked(useStartOrderMutation)
const mockedUsePickItemMutation = jest.mocked(usePickItemMutation)
const mockedUseCompleteOrderMutation = jest.mocked(useCompleteOrderMutation)
const mockedUseCreateAlertMutation = jest.mocked(useCreateAlertMutation)

const detail: OrderDetail = {
  orderType: 'NP',
  orderNumber: '100',
  customerName: 'Cliente Uno',
  warehouse: { id: 4, code: 'DEP-04', name: 'Deposito Norte', isActive: true },
  total: 1200,
  status: 'in_progress',
  totalItems: 1,
  pickedItems: 0,
  completedPercentage: 0,
  startedAt: '2026-03-12T12:00:00Z',
  completedAt: null,
  assignedTo: { id: 7, name: 'Ada Operaria' },
  items: [
    {
      productCode: 'SKU-1',
      description: 'Producto 1',
      quantityRequired: 2,
      quantityPicked: 0,
      lot: null,
      location: 'A-01',
      status: 'pending',
      stockInfo: null,
    },
  ],
  alerts: [],
  events: [],
}

describe('OrderDetailScreen', () => {
  beforeEach(() => {
    mockGoBack.mockReset()
    mockedUseOrderDetail.mockReturnValue({
      data: detail,
      isPending: false,
      isError: false,
      isSuccess: true,
      error: null,
      refetch: jest.fn(),
    } as never)
    mockedUseOrderStockValidations.mockReturnValue({
      data: [],
      refetch: jest.fn(),
    } as never)
    mockedUseStartOrderMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as never)
    mockedUseCompleteOrderMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as never)
  })

  it('surfaces pick failures and refreshes validations afterwards', async () => {
    const refetchValidations = jest.fn()
    mockedUseOrderStockValidations.mockReturnValue({
      data: [],
      refetch: refetchValidations,
    } as never)
    mockedUsePickItemMutation.mockReturnValue({
      mutate: (_input: unknown, options: { onError?: (error: Error) => void; onSettled?: () => void }) => {
        options.onError?.(new Error('Stock insuficiente'))
        options.onSettled?.()
      },
      isPending: false,
    } as never)
    mockedUseCreateAlertMutation.mockReturnValue({
      mutate: jest.fn(),
      reset: jest.fn(),
      isPending: false,
      error: null,
    } as never)

    render(<OrderDetailScreen />)

    fireEvent.press(screen.getByText('pick SKU-1'))

    expect(screen.getByText('No pudimos confirmar SKU-1')).toBeTruthy()
    expect(screen.getByText('Stock insuficiente')).toBeTruthy()
    expect(refetchValidations).toHaveBeenCalledTimes(1)
  })

  it('keeps the operator on detail after creating an item alert', async () => {
    const reset = jest.fn()
    mockedUsePickItemMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as never)
    mockedUseCreateAlertMutation.mockReturnValue({
      mutate: (_input: unknown, options: { onSuccess?: (alert: { productCode: string }) => void }) => {
        options.onSuccess?.({ productCode: 'SKU-1' })
      },
      reset,
      isPending: false,
      error: null,
    } as never)

    render(<OrderDetailScreen />)

    fireEvent.press(screen.getByText('alert SKU-1'))
    expect(screen.getByText('Composer SKU-1')).toBeTruthy()

    fireEvent.press(screen.getByText('enviar alerta mock'))

    await waitFor(() => {
      expect(screen.getByText('Alerta enviada')).toBeTruthy()
    })
    expect(screen.getByText('Avisamos al equipo admin sobre SKU-1. La alerta ya aparece en este pedido.')).toBeTruthy()
    expect(reset).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Composer SKU-1')).toBeNull()
  })
})
