import { NavigationContainer } from '@react-navigation/native'

import { useAuthStore } from '../stores/auth-store'
import { AuthStack } from './AuthStack'
import { navigationTheme } from './navigation-theme'
import { OperatorStack } from './OperatorStack'

export function RootNavigator() {
  const bootstrapStatus = useAuthStore((state) => state.bootstrapStatus)
  const user = useAuthStore((state) => state.user)

  const showOperatorFlow = bootstrapStatus === 'authenticated' && user?.warehouse?.isActive !== false

  return <NavigationContainer theme={navigationTheme}>{showOperatorFlow ? <OperatorStack /> : <AuthStack />}</NavigationContainer>
}
