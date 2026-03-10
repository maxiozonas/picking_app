import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/pages/LoginPage'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy-load heavy pages for route-level code splitting
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const OrdersPage = lazy(() => import('@/pages/OrdersPage').then(m => ({ default: m.OrdersPage })))
const InProgressPage = lazy(() => import('@/pages/InProgressPage').then(m => ({ default: m.InProgressPage })))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })))
const InventoryPage = lazy(() => import('@/pages/InventoryPage').then(m => ({ default: m.InventoryPage })))
const EmployeesPage = lazy(() => import('@/pages/EmployeesPage').then(m => ({ default: m.EmployeesPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

	        {/* Protected routes */}
	        <Route
		      path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<PageSkeleton />}>
                      <Routes>
                        <Route index element={<DashboardPage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="orders/in-progress" element={<InProgressPage />} />
                        <Route path="orders/:orderNumber" element={<OrderDetailPage />} />
                        <Route path="inventory" element={<InventoryPage />} />
                        <Route path="employees" element={<EmployeesPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
