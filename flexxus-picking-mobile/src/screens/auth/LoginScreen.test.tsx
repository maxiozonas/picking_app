import { fireEvent, render, screen } from '@testing-library/react-native'

import { ApiError } from '../../lib/api/errors'
import { LoginScreen } from './LoginScreen'
import { useLoginMutation } from '../../features/auth/hooks'

jest.mock('../../features/auth/hooks', () => ({
  useLoginMutation: jest.fn(),
}))

const mockedUseLoginMutation = jest.mocked(useLoginMutation)

describe('LoginScreen', () => {
  it('submits trimmed credentials', () => {
    const mutate = jest.fn()
    mockedUseLoginMutation.mockReturnValue({
      mutate,
      isPending: false,
      isError: false,
      error: null,
    } as never)

    render(<LoginScreen />)

    fireEvent.changeText(screen.getByPlaceholderText('operario'), '  operario.turno  ')
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'secret123')
    fireEvent.press(screen.getByText('Ingresar al picking'))

    expect(mutate).toHaveBeenCalledWith({
      username: 'operario.turno',
      password: 'secret123',
    })
  })

  it('renders server field feedback without the generic error card', () => {
    mockedUseLoginMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isError: true,
      error: new ApiError('Credenciales invalidas', {
        fields: {
          username: ['Revisa el usuario'],
        },
      }),
    } as never)

    render(<LoginScreen />)

    expect(screen.getByText('Revisa el usuario')).toBeTruthy()
    expect(screen.queryByText('No pudimos iniciar sesion')).toBeNull()
  })
})
