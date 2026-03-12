import { useEffect } from 'react'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

import { ErrorState } from '../components/ui/ErrorState'
import { LoadingBlock } from '../components/ui/LoadingBlock'
import { Screen } from '../components/ui/Screen'
import { getCurrentUser } from '../features/auth/api'
import { RootNavigator } from '../navigation/RootNavigator'
import { useAuthStore } from '../stores/auth-store'

// Prevent splash screen from auto-hiding while we load custom fonts
void SplashScreen.preventAutoHideAsync()

// Font configuration matching desktop weights
const FONT_CONFIG = {
  'IBM Plex Sans': require('../../assets/fonts/IBM Plex Sans-Regular.ttf'),
  'IBM Plex Sans-Medium': require('../../assets/fonts/IBM Plex Sans-Medium.ttf'),
  'IBM Plex Sans-SemiBold': require('../../assets/fonts/IBM Plex Sans-SemiBold.ttf'),
  'Barlow Condensed': require('../../assets/fonts/Barlow Condensed-Regular.ttf'),
  'Barlow Condensed-SemiBold': require('../../assets/fonts/Barlow Condensed-SemiBold.ttf'),
  'Barlow Condensed-Bold': require('../../assets/fonts/Barlow Condensed-Bold.ttf'),
  'IBM Plex Mono': require('../../assets/fonts/IBM Plex Mono-Regular.ttf'),
} as const

export function AppBootstrap() {
  const [fontsLoaded] = useFonts(FONT_CONFIG)
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const bootstrapStatus = useAuthStore((state) => state.bootstrapStatus)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    void bootstrap(getCurrentUser)
  }, [bootstrap])

  // Hide splash screen when fonts AND auth state are loaded
  useEffect(() => {
    if (fontsLoaded && hasHydrated && bootstrapStatus !== 'restoring') {
      void SplashScreen.hideAsync()
    }
  }, [fontsLoaded, hasHydrated, bootstrapStatus])

  // Show loading state while fonts load OR auth state restores
  if (!fontsLoaded || !hasHydrated || bootstrapStatus === 'restoring') {
    return (
      <Screen eyebrow="Inicio seguro" title="Validando sesion" subtitle="Confirmamos deposito y credenciales antes de liberar la operacion.">
        <LoadingBlock />
      </Screen>
    )
  }

  if (bootstrapStatus === 'authenticated' && (!user?.warehouse || user.warehouse.isActive === false)) {
    return (
      <Screen eyebrow="Asignacion requerida" title="No hay deposito operativo" subtitle="La cuenta inicio sesion, pero el backend no devolvio un deposito utilizable.">
        <ErrorState
          actionLabel="Cerrar sesion"
          message="Pedi a un administrador que revise la asignacion del operario antes de reintentar."
          onAction={() => {
            void logout()
          }}
          title="No podemos abrir pedidos pendientes"
        />
      </Screen>
    )
  }

  return <RootNavigator />
}
