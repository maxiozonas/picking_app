import { fireEvent, render, screen } from '@testing-library/react-native'

import { AlertComposerSheet } from './AlertComposerSheet'

describe('AlertComposerSheet', () => {
  it('blocks submit until a message is provided', () => {
    const onSubmit = jest.fn()

    render(
      <AlertComposerSheet
        availableProductCodes={['SKU-1']}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        orderNumber="NP-100"
        visible
      />,
    )

    fireEvent.press(screen.getByText('Enviar alerta'))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Describe que esta pasando antes de avisar al equipo admin.')).toBeTruthy()
  })

  it('preserves the draft after server validation feedback while the sheet stays open', () => {
    const onSubmit = jest.fn()
    const { rerender } = render(
      <AlertComposerSheet
        availableProductCodes={['SKU-1', 'SKU-2']}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        orderNumber="NP-100"
        selectedProductCode="SKU-1"
        visible
      />,
    )

    fireEvent.changeText(
      screen.getByPlaceholderText('Ej: La ubicacion esta vacia y faltan 3 unidades para completar el pedido.'),
      'Faltan dos unidades en la ubicacion',
    )
    fireEvent.changeText(screen.getByPlaceholderText('Ej: SKU-123'), 'sku-22')

    rerender(
      <AlertComposerSheet
        availableProductCodes={['SKU-1', 'SKU-2']}
        errorMessage="La validacion fallo"
        fieldErrors={{ product_code: ['Producto invalido'] }}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        orderNumber="NP-100"
        selectedProductCode="SKU-1"
        visible
      />,
    )

    expect(screen.getByDisplayValue('Faltan dos unidades en la ubicacion')).toBeTruthy()
    expect(screen.getByDisplayValue('sku-22')).toBeTruthy()
    expect(screen.getByText('Producto invalido')).toBeTruthy()
  })

  it('normalizes the payload before submit', () => {
    const onSubmit = jest.fn()

    render(
      <AlertComposerSheet
        availableProductCodes={['SKU-1']}
        onClose={jest.fn()}
        onSubmit={onSubmit}
        orderNumber="NP-100"
        visible
      />,
    )

    fireEvent.changeText(screen.getByPlaceholderText('Ej: SKU-123'), 'sku-99')
    fireEvent.changeText(
      screen.getByPlaceholderText('Ej: La ubicacion esta vacia y faltan 3 unidades para completar el pedido.'),
      '  bloqueo parcial en pasillo 4  ',
    )
    fireEvent.press(screen.getByText('Enviar alerta'))

    expect(onSubmit).toHaveBeenCalledWith({
      alertType: 'order_issue',
      severity: 'medium',
      message: 'bloqueo parcial en pasillo 4',
      productCode: 'SKU-99',
    })
  })
})
