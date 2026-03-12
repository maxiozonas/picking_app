import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { Screen } from '../../components/ui/Screen'
import { TextField } from '../../components/ui/TextField'
import { useLoginMutation } from '../../features/auth/hooks'
import { ApiError } from '../../lib/api/errors'
import { colors, radius, spacing, theme } from '../../theme'

export function LoginScreen() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useLoginMutation()
  const fieldErrors = loginMutation.error instanceof ApiError ? loginMutation.error.fields : undefined

  const canSubmit = useMemo(() => username.trim().length > 0 && password.length > 0, [password.length, username])

  return (
    <Screen
      eyebrow="Operadores"
      title="Picking en movimiento"
      subtitle="Ingresa con tu usuario de deposito. La app valida la sesion con el backend antes de abrir el flujo operativo."
      scrollable
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroMetric}>01</Text>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Acceso directo al turno</Text>
          <Text style={styles.heroText}>Sin menus densos ni cambios de deposito manuales. El contexto llega desde tu cuenta.</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          error={fieldErrors?.username?.[0]}
          label="Usuario"
          onChangeText={setUsername}
          placeholder="operario"
          value={username}
        />
        <TextField
          error={fieldErrors?.password?.[0]}
          label="Clave"
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          value={password}
        />
        <Button
          disabled={!canSubmit}
          label="Ingresar al picking"
          loading={loginMutation.isPending}
          onPress={() => loginMutation.mutate({ username: username.trim(), password })}
        />
      </View>

      {loginMutation.isError && !fieldErrors ? (
        <ErrorState
          title="No pudimos iniciar sesion"
          message={loginMutation.error.message}
        />
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  heroMetric: {
    color: colors.accent,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 52,
    lineHeight: 52,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xxl,
  },
  heroText: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
})
