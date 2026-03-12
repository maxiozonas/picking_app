import { AppProviders } from './src/app/AppProviders'
import { AppBootstrap } from './src/app/AppBootstrap'

export default function App() {
  return (
    <AppProviders>
      <AppBootstrap />
    </AppProviders>
  )
}
