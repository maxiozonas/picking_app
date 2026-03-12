import 'react-native-gesture-handler/jestSetup'

import { afterEach, jest } from '@jest/globals'
import { cleanup } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react')

  function MockModal({ children, visible }: { children?: React.ReactNode; visible?: boolean }) {
    return visible ? React.createElement(React.Fragment, null, children) : null
  }

  return {
    __esModule: true,
    default: MockModal,
  }
})

jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  const { View } = require('react-native')

  return {
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    SafeAreaView: ({ children, ...props }: { children?: React.ReactNode }) => React.createElement(View, props, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  }
})

jest.mock('@shopify/flash-list', () => {
  const React = require('react')
  const { Pressable, View } = require('react-native')

  return {
    FlashList: ({
      data,
      renderItem,
      keyExtractor,
      ListHeaderComponent,
      ListEmptyComponent,
      ListFooterComponent,
      onEndReached,
      refreshControl,
    }: {
      data: unknown[]
      renderItem: (info: { item: unknown; index: number }) => React.ReactNode
      keyExtractor?: (item: unknown, index: number) => string
      ListHeaderComponent?: React.ReactNode
      ListEmptyComponent?: React.ReactNode
      ListFooterComponent?: React.ReactNode
      onEndReached?: () => void
      refreshControl?: React.ReactNode
    }) =>
      React.createElement(
        View,
        null,
        ListHeaderComponent,
        data.length === 0
          ? ListEmptyComponent
          : data.map((item, index) =>
              React.createElement(View, { key: keyExtractor ? keyExtractor(item, index) : String(index) }, renderItem({ item, index })),
            ),
        ListFooterComponent,
        refreshControl,
        onEndReached
          ? React.createElement(
              Pressable,
              { onPress: onEndReached, testID: 'flash-list-end' },
              null,
            )
          : null,
      ),
  }
})

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
  jest.useRealTimers()
})
