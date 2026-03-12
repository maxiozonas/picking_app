import { unwrapLaravelEnvelope } from './envelope'

describe('unwrapLaravelEnvelope', () => {
  it('unwraps success envelopes used by auth endpoints', () => {
    expect(
      unwrapLaravelEnvelope({
        success: true,
        data: { token: 'abc' },
      }),
    ).toEqual({ token: 'abc' })
  })

  it('unwraps single-resource payloads', () => {
    expect(
      unwrapLaravelEnvelope({
        data: { id: 12, status: 'pending' },
      }),
    ).toEqual({ id: 12, status: 'pending' })
  })

  it('keeps paginated payloads intact', () => {
    const payload = {
      data: [{ id: 1 }],
      meta: { current_page: 1, last_page: 3 },
      links: { next: 'page=2' },
    }

    expect(unwrapLaravelEnvelope(payload)).toEqual(payload)
  })
})
