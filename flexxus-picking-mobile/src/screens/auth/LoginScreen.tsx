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
      title="Acceso operativo"
      scrollable
    >
      <View style={styles.heroCard}>
        <View style={styles.heroBadgeRow}>
          <Text style={styles.heroBadge}>Flexxus</Text>
          <Text style={styles.heroMeta}>Mobile</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Picking</Text>
          <Text style={styles.heroText}>Inicio de turno</Text>
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
          label="Ingresar"
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
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    ...theme.shadows.card,
  },
  heroBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroBadge: {
    color: colors.accent,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroMeta: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.sm,
  },
  heroCopy: {
    gap: spacing.xs,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 58,
    lineHeight: 52,
    textTransform: 'uppercase',
  },
  heroText: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.lg,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  formCard: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...theme.shadows.card,
  },
})
