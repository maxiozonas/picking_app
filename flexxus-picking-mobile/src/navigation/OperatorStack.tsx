import { Pressable, StyleSheet, Text } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { useLogoutMutation } from '../features/auth/hooks'
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen'
import { PendingOrdersScreen } from '../screens/orders/PendingOrdersScreen'
import { colors, theme } from '../theme'
import type { OperatorStackParamList } from './types'

const Stack = createNativeStackNavigator<OperatorStackParamList>()

function HeaderLogoutButton() {
  const logoutMutation = useLogoutMutation()

  return (
    <Pressable disabled={logoutMutation.isPending} onPress={() => logoutMutation.mutate()} style={({ pressed }) => [styles.logoutButton, pressed ? styles.logoutButtonPressed : null]}>
      <Text style={styles.logoutButtonLabel}>{logoutMutation.isPending ? 'Saliendo...' : 'Salir'}</Text>
    </Pressable>
  )
}

export function OperatorStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamily.display,
          fontSize: theme.typography.fontSize.xl,
        },
      }}
    >
      <Stack.Screen
        name="PendingOrders"
        component={PendingOrdersScreen}
        options={{
          title: 'Pedidos pendientes',
          headerRight: HeaderLogoutButton,
        }}
      />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Detalle de pedido' }} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  logoutButton: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  logoutButtonPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  logoutButtonLabel: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
})
