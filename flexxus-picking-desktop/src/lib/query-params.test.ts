import { describe, expect, it } from 'vitest'

import { buildPathWithQuery, buildQueryString } from './query-params'

describe('query-params', () => {
  it('builds ordered query strings', () => {
    const query = buildQueryString([
      ['warehouse_id', 2],
      ['search', 'ABC'],
      ['status', 'pending'],
      ['per_page', 15],
      ['page', 1],
    ])

    expect(query).toBe('warehouse_id=2&search=ABC&status=pending&per_page=15&page=1')
  })

  it('skips nullish and empty-string values but keeps false and zero', () => {
    const query = buildQueryString([
      ['a', undefined],
      ['b', null],
      ['c', ''],
      ['d', false],
      ['e', 0],
    ])

    expect(query).toBe('d=false&e=0')
  })

  it('builds endpoint path with query only when needed', () => {
    expect(buildPathWithQuery('/admin/stats', [['warehouse_id', 1]])).toBe('/admin/stats?warehouse_id=1')
    expect(buildPathWithQuery('/admin/stats', [])).toBe('/admin/stats')
  })
})
