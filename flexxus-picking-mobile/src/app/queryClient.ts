import type { InfiniteData } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'

const nonRetryableStatuses = [401, 403, 404, 422]

type ErrorWithStatus = {
  status?: number
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: (failureCount, error) => {
        const status = (error as ErrorWithStatus | undefined)?.status

        if (typeof status === 'number' && nonRetryableStatuses.includes(status)) {
          return false
        }

        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
})

export function patchInfiniteQueryItem<TPage extends { data: TItem[] }, TItem>(
  current: InfiniteData<TPage> | undefined,
  matcher: (item: TItem) => boolean,
  updater: (item: TItem) => TItem,
): InfiniteData<TPage> | undefined {
  if (!current) {
    return current
  }

  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      data: page.data.map((item) => (matcher(item) ? updater(item) : item)),
    })),
  }
}
