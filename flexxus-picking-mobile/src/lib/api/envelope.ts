type LaravelEnvelope<T> = {
  success?: boolean
  data?: T
  meta?: unknown
  links?: unknown
}

export function unwrapLaravelEnvelope<T>(payload: T | LaravelEnvelope<T>): T | LaravelEnvelope<T> {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  const envelope = payload as LaravelEnvelope<T>

  if (Array.isArray(envelope.data) && envelope.meta) {
    return payload
  }

  if ('success' in envelope && envelope.data !== undefined) {
    return envelope.data
  }

  if (envelope.data && typeof envelope.data === 'object' && !Array.isArray(envelope.data)) {
    return envelope.data
  }

  return payload
}
