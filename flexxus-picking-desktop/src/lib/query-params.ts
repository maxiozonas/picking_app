export type QueryParamValue = string | number | boolean | null | undefined
export type QueryParamEntry = readonly [key: string, value: QueryParamValue]

export function buildQueryString(entries: readonly QueryParamEntry[]): string {
  const params = new URLSearchParams()

  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') {
      continue
    }

    params.append(key, String(value))
  }

  return params.toString()
}

export function buildPathWithQuery(path: string, entries: readonly QueryParamEntry[]): string {
  const query = buildQueryString(entries)
  return query.length > 0 ? `${path}?${query}` : path
}
