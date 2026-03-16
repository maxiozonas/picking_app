import { useEffect, useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import type { ApiFieldErrors } from '../../../lib/api/errors'
import { formatOrderCode } from '../../../lib/utils/format'
import { colors, radius, spacing, theme } from '../../../theme'
import {
  alertSeverityOptions,
  alertTypeOptions,
  type AlertSeverity,
  type AlertType,
  type CreateAlertInput,
} from '../types'

type AlertComposerSheetProps = {
  visible: boolean
  orderNumber: string
  availableProductCodes: string[]
  selectedProductCode?: string | null
  isSubmitting?: boolean
  errorMessage?: string | null
  fieldErrors?: ApiFieldErrors
  onClose: () => void
  onSubmit: (input: CreateAlertInput) => void
}

function defaultDraft(selectedProductCode?: string | null) {
  return {
    alertType: (selectedProductCode ? 'insufficient_stock' : 'order_issue') as AlertType,
    severity: (selectedProductCode ? 'high' : 'medium') as AlertSeverity,
    message: '',
    productCode: selectedProductCode ?? '',
  }
}

export function AlertComposerSheet({
  visible,
  orderNumber,
  availableProductCodes,
  selectedProductCode,
  isSubmitting,
  errorMessage,
  fieldErrors,
  onClose,
  onSubmit,
}: AlertComposerSheetProps) {
  const [alertType, setAlertType] = useState<AlertType>('order_issue')
  const [severity, setSeverity] = useState<AlertSeverity>('medium')
  const [message, setMessage] = useState('')
  const [productCode, setProductCode] = useState('')
  const [localMessageError, setLocalMessageError] = useState<string | null>(null)

  const suggestedProductCodes = useMemo(() => {
    const nextCodes = new Set<string>()

    if (selectedProductCode) {
      nextCodes.add(selectedProductCode)
    }

    availableProductCodes.forEach((code) => {
      if (nextCodes.size < 6) {
        nextCodes.add(code)
      }
    })

    return Array.from(nextCodes)
  }, [availableProductCodes, selectedProductCode])

  useEffect(() => {
    if (!visible) {
      return
    }

    const draft = defaultDraft(selectedProductCode)
    setAlertType(draft.alertType)
    setSeverity(draft.severity)
    setMessage(draft.message)
    setProductCode(draft.productCode)
    setLocalMessageError(null)
  }, [visible, selectedProductCode, orderNumber])

  const messageError = localMessageError ?? fieldErrors?.message?.[0] ?? null
  const productCodeError = fieldErrors?.product_code?.[0] ?? null
  const alertTypeError = fieldErrors?.alert_type?.[0] ?? null
  const severityError = fieldErrors?.severity?.[0] ?? null

  const handleSubmit = () => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage) {
      setLocalMessageError('Describe que esta pasando antes de avisar al equipo admin.')
      return
    }

    setLocalMessageError(null)
    onSubmit({
      alertType,
      severity,
      message: trimmedMessage,
      productCode: productCode.trim() ? productCode.trim().toUpperCase() : null,
    })
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalRoot}>
        <Pressable onPress={onClose} style={styles.backdrop} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>Incidencia</Text>
                <Text style={styles.title}>Nueva alerta operativa</Text>
              </View>
              <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed ? styles.closeButtonPressed : null]}>
                <Text style={styles.closeButtonLabel}>Cerrar</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.contextCard}>
                <Text style={styles.contextLabel}>Pedido activo</Text>
                <Text style={styles.contextValue}>{formatOrderCode(undefined, orderNumber)}</Text>
              </View>

              <View style={styles.group}>
                <Text style={styles.groupLabel}>Tipo de alerta</Text>
                <View style={styles.optionGrid}>
                  {alertTypeOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setAlertType(option.value)}
                      style={({ pressed }) => [
                        styles.optionCard,
                        alertType === option.value ? styles.optionCardSelected : null,
                        pressed ? styles.optionCardPressed : null,
                      ]}
                    >
                      <Text style={[styles.optionTitle, alertType === option.value ? styles.optionTitleSelected : null]}>{option.label}</Text>
                      <Text style={[styles.optionDescription, alertType === option.value ? styles.optionDescriptionSelected : null]}>{option.description}</Text>
                    </Pressable>
                  ))}
                </View>
                {alertTypeError ? <Text style={styles.errorText}>{alertTypeError}</Text> : null}
              </View>

              <View style={styles.group}>
                <Text style={styles.groupLabel}>Prioridad</Text>
                <View style={styles.optionGrid}>
                  {alertSeverityOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setSeverity(option.value)}
                      style={({ pressed }) => [
                        styles.optionCard,
                        severity === option.value ? styles.optionCardSelected : null,
                        pressed ? styles.optionCardPressed : null,
                      ]}
                    >
                      <Text style={[styles.optionTitle, severity === option.value ? styles.optionTitleSelected : null]}>{option.label}</Text>
                      <Text style={[styles.optionDescription, severity === option.value ? styles.optionDescriptionSelected : null]}>{option.description}</Text>
                    </Pressable>
                  ))}
                </View>
                {severityError ? <Text style={styles.errorText}>{severityError}</Text> : null}
              </View>

              <View style={styles.group}>
                <Text style={styles.groupLabel}>Producto opcional</Text>
                <View style={styles.productRow}>
                  <Pressable
                    onPress={() => setProductCode('')}
                    style={({ pressed }) => [
                      styles.productChip,
                      !productCode ? styles.productChipSelected : null,
                      pressed ? styles.productChipPressed : null,
                    ]}
                  >
                    <Text style={[styles.productChipLabel, !productCode ? styles.productChipLabelSelected : null]}>Pedido completo</Text>
                  </Pressable>
                  {suggestedProductCodes.map((code) => (
                    <Pressable
                      key={code}
                      onPress={() => setProductCode(code)}
                      style={({ pressed }) => [
                        styles.productChip,
                        productCode === code ? styles.productChipSelected : null,
                        pressed ? styles.productChipPressed : null,
                      ]}
                    >
                      <Text style={[styles.productChipLabel, productCode === code ? styles.productChipLabelSelected : null]}>{code}</Text>
                    </Pressable>
                  ))}
                </View>
                <TextField
                  autoCapitalize="characters"
                  error={productCodeError}
                  label="Codigo de producto"
                  onChangeText={setProductCode}
                  placeholder="Ej: SKU-123"
                  value={productCode}
                />
              </View>

              <TextField
                error={messageError}
                label="Mensaje para administracion"
                multiline
                numberOfLines={5}
                onChangeText={setMessage}
                placeholder="Ej: La ubicacion esta vacia y faltan 3 unidades para completar el pedido."
                value={message}
              />

              {errorMessage && !messageError && !productCodeError && !alertTypeError && !severityError ? (
                <View style={styles.serverErrorCard}>
                  <Text style={styles.serverErrorTitle}>No pudimos enviar la alerta</Text>
                  <Text style={styles.serverErrorMessage}>{errorMessage}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.footer}>
              <Button label="Cancelar" onPress={onClose} variant="ghost" />
              <Button label="Enviar alerta" loading={isSubmitting} onPress={handleSubmit} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    maxHeight: '92%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.pill,
    height: 6,
    marginBottom: spacing.md,
    width: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.xxl,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  closeButton: {
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  closeButtonPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  closeButtonLabel: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    textTransform: 'uppercase',
  },
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  contextCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  contextLabel: {
    color: colors.textSoft,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    textTransform: 'uppercase',
  },
  contextValue: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: theme.typography.fontSize.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.lg,
  },
  optionGrid: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.surfaceInset,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  optionCardPressed: {
    opacity: 0.9,
  },
  optionTitle: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.lg,
  },
  optionTitleSelected: {
    color: colors.white,
  },
  optionDescription: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: colors.white,
  },
  productRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  productChip: {
    backgroundColor: colors.surfaceInset,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  productChipSelected: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.accent,
  },
  productChipPressed: {
    opacity: 0.9,
  },
  productChipLabel: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.sm,
    textTransform: 'uppercase',
  },
  productChipLabelSelected: {
    color: colors.text,
  },
  errorText: {
    color: colors.danger,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
  },
  serverErrorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  serverErrorTitle: {
    color: colors.text,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize.lg,
  },
  serverErrorMessage: {
    color: colors.textMuted,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
})
