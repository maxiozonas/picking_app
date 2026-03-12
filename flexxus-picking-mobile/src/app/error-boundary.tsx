import type { ReactNode } from 'react'
import { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors, spacing, theme } from '../theme'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.eyebrow}>FLEXXUS PICKING</Text>
          <Text style={styles.title}>La app necesita reiniciarse.</Text>
          <Text style={styles.message}>Se produjo un fallo inesperado en la interfaz operativa.</Text>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1.8,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.display,
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.md,
  },
})
