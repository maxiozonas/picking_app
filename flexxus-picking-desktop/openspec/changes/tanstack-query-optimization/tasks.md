# Tasks: TanStack Query Optimization

## Phase 1: Foundation / Setup (Effort: 30 min)

- [ ] 1.1 Install @tanstack/react-query-devtools dependency
  - **File**: `package.json` (via pnpm)
  - **Command**: `pnpm add @tanstack/react-query-devtools`
  - **Acceptance**: Dependency added to devDependencies with version compatible with @tanstack/react-query@5.62.0
  - **Verification**: Run `pnpm list @tanstack/react-query-devtools` and verify version

- [ ] 1.2 Create `src/lib/query-config.ts` with centralized cache constants
  - **File**: `src/lib/query-config.ts` (NEW)
  - **Content**: QueryCacheTime, QueryRetryConfig, NonRetryableStatuses constants
  - **Acceptance**: All constants exported with `as const`, JSDoc comments included
  - **Verification**: File exists, exports match design document, TypeScript types are correct

## Phase 2: Core Configuration (Effort: 45 min)

- [ ] 2.1 Update QueryClient configuration in App.tsx
  - **File**: `src/App.tsx`
  - **Changes**:
    - Import ReactQueryDevtools
    - Import query-config constants
    - Add retry function with error classification (401, 403, 4xx non-retryable)
    - Add retryDelay function with exponential backoff (1s, 2s, 4s, max 30s)
    - Update defaultOptions: staleTime: 60000, gcTime: 300000, retry: retryFn, retryDelay: retryDelay
    - Set refetchOnMount: false
  - **Acceptance**: QueryClient uses new configuration, DevTools imported
  - **Verification**: Run dev server, check console for no errors, verify QueryClient config matches design

- [ ] 2.2 Add ReactQueryDevtools component in dev mode
  - **File**: `src/App.tsx`
  - **Changes**: Add `<ReactQueryDevtools initialIsOpen={false} position="bottom-right" />` inside QueryClientProvider, wrapped in `import.meta.env.DEV` check
  - **Acceptance**: DevTools button visible in dev mode, hidden in production build
  - **Verification**: Run `pnpm dev` - see floating button, run `pnpm build && pnpm preview` - no button visible

- [ ] 2.3 Create retry and retryDelay utility functions
  - **File**: `src/lib/query-config.ts` (UPDATE)
  - **Changes**: Export retryFn and retryDelay functions for testing
  - **Acceptance**: Functions exported with TypeScript type signatures
  - **Verification**: Functions can be imported in test files

## Phase 3: Hook Updates - Core Hooks (Effort: 1 hr)

- [x] 3.1 Update useStats hook - Remove polling, update staleTime
  - **File**: `src/hooks/use-stats.ts`
  - **Changes**:
    - Remove `refetchInterval: 30000` (stop automatic polling)
    - Import QueryCacheTime from query-config
    - Set staleTime to QueryCacheTime.Stats (30000ms)
    - Update JSDoc comments
  - **Acceptance**: Hook uses centralized constants, no auto-polling
  - **Verification**: Hook returns data, test that no automatic refetch occurs after 30s

- [x] 3.2 Update useOrders hook - Add placeholder data, update staleTime
  - **File**: `src/hooks/use-orders.ts`
  - **Changes**:
    - Import QueryCacheTime from query-config
    - Set staleTime to QueryCacheTime.Orders (45000ms) for list
    - Set staleTime to QueryCacheTime.OrderDetail (60000ms) for detail query
    - Add placeholderData function returning 15 empty order objects
    - Ensure enabled option works correctly
  - **Acceptance**: List query shows 15 placeholder rows, detail uses correct staleTime
  - **Verification**: Navigate to /admin/orders - see placeholders before data loads, check DevTools for staleTime

- [x] 3.3 Update usePendingOrders hook - Add placeholder data, update staleTime
  - **File**: `src/hooks/use-pending-orders.ts`
  - **Changes**:
    - Import QueryCacheTime from query-config
    - Set staleTime to QueryCacheTime.PendingOrders (30000ms)
    - Add placeholderData function returning 15 empty order objects
  - **Acceptance**: Query shows placeholders, uses correct staleTime
  - **Verification**: Navigate to pending orders page - see placeholders before data loads

## Phase 4: Hook Updates - Entity Management (Effort: 1 hr 15 min)

- [ ] 4.1 Update useEmployees hook - Add placeholder data, mutation error handling
  - **File**: `src/hooks/use-employees.ts`
  - **Changes**:
    - Import QueryCacheTime and toast from sonner
    - Set staleTime to QueryCacheTime.Employees (60000ms)
    - Set staleTime to QueryCacheTime.Warehouses (300000ms) for warehouses query
    - Add placeholderData for employees list
    - Add onError callbacks to mutations (create, update, delete) with toast notifications
    - Update JSDoc comments
  - **Acceptance**: Mutations show toast errors, placeholders render, correct staleTime values
  - **Verification**: Try creating invalid employee - see toast error, check placeholders on list load

- [ ] 4.2 Update useInventory hook - Add placeholder data, update staleTime
  - **File**: `src/hooks/use-inventory.ts`
  - **Changes**:
    - Import QueryCacheTime from query-config
    - Set staleTime to QueryCacheTime.Inventory (30000ms)
    - Add placeholderData function for inventory list
    - Ensure search query does NOT use placeholder data
  - **Acceptance**: List shows placeholders, search does not show placeholders
  - **Verification**: Navigate to /admin/inventory - see placeholders, test search - no placeholders

- [ ] 4.3 Update useOrderDetail hook - Update staleTime
  - **File**: `src/hooks/use-order-detail.ts` (if separate from use-orders)
  - **Changes**:
    - Import QueryCacheTime from query-config
    - Set staleTime to QueryCacheTime.OrderDetail (60000ms)
  - **Acceptance**: Detail query uses correct staleTime
  - **Verification**: Navigate to order detail page, check DevTools for query configuration

- [ ] 4.4 Update useWarehouses hook - Update staleTime to 5 minutes
  - **File**: `src/hooks/use-warehouses.ts` or within use-employees.ts
  - **Changes**:
    - Import QueryCacheTime from query-config
    - Set staleTime to QueryCacheTime.Warehouses (300000ms)
  - **Acceptance**: Warehouses cached for 5 minutes
  - **Verification**: Check DevTools - warehouse query has 5min staleTime

- [ ] 4.5 Update useStockSearch hook - Debouncing and minimum query length
  - **File**: `src/hooks/use-stock-search.ts`
  - **Changes**:
    - Import QueryCacheTime from query-config
    - Set staleTime to QueryCacheTime.Inventory (30000ms)
    - Ensure enabled option checks query.length >= 2
    - Add debounce to queryFn (300ms)
    - Ensure NO placeholder data
  - **Acceptance**: Search only fires with 2+ chars, debounced, cached for 30s
  - **Verification**: Type 1 char - no request, type 2nd char - request fires after 300ms

## Phase 5: Testing - Unit Tests (Effort: 1 hr 30 min)

- [ ] 5.1 Write unit tests for retry logic
  - **File**: `src/lib/__tests__/query-config.test.ts` (NEW)
  - **Tests**:
    - Test retryFn returns false for 401, 403 errors
    - Test retryFn returns false for 4xx errors (except 408, 429)
    - Test retryFn returns true for 5xx errors up to 3 attempts
    - Test retryFn returns false after 3 failures
    - Test retryFn returns true for network errors (no status)
    - Test retryDelay exponential backoff (1s, 2s, 4s, max 30s)
  - **Acceptance**: All tests pass, edge cases covered
  - **Verification**: Run `pnpm test src/lib/__tests__/query-config.test.ts`

- [ ] 5.2 Write unit tests for placeholder data generators
  - **File**: Create test files for each hook with placeholders
  - **Tests**:
    - Test placeholder data has correct structure
    - Test placeholder data length matches perPage parameter
    - Test placeholder data has all required fields
  - **Acceptance**: Placeholder generators tested
  - **Verification**: Run tests for each hook

- [ ] 5.3 Update existing hook tests for new configuration
  - **Files**: Update all `*.test.ts` files for hooks
  - **Changes**:
    - Update staleTime expectations in tests
    - Add tests for placeholder data rendering
    - Add tests for query cache behavior
    - Update mock data to match new structure
  - **Acceptance**: All existing tests still pass with new config
  - **Verification**: Run `pnpm test` - all tests pass

## Phase 6: Testing - Integration Tests (Effort: 1 hr)

- [ ] 6.1 Write integration tests for DevTools presence
  - **File**: `src/test/integration/devtools.test.tsx` (NEW)
  - **Tests**:
    - Test DevTools component renders in dev mode
    - Test DevTools does NOT render in production
  - **Acceptance**: DevTools presence verified by test
  - **Verification**: Run `pnpm test src/test/integration/devtools.test.tsx`

- [ ] 6.2 Write integration tests for cache behavior
  - **File**: `src/test/integration/cache-behavior.test.tsx` (NEW)
  - **Tests**:
    - Test queries cache data during staleTime period
    - Test background refetch occurs after staleTime expires
    - Test placeholder data renders before real data
    - Test smooth transition from placeholder to real data
  - **Acceptance**: Cache behavior verified with MSW mocks
  - **Verification**: Run integration tests, verify cache behavior

- [ ] 6.3 Write integration tests for retry with MSW
  - **File**: `src/test/integration/retry-behavior.test.tsx` (NEW)
  - **Tests**:
    - Test query retries on 500 error up to 3 times
    - Test query fails immediately on 401 error (no retry)
    - Test query fails immediately on 4xx error (except 408)
    - Test exponential backoff timing with fake timers
  - **Acceptance**: Retry behavior verified with MSW failure simulation
  - **Verification**: Run tests, verify retry patterns

- [ ] 6.4 Write integration tests for mutation error handling
  - **File**: `src/test/integration/mutation-errors.test.tsx` (NEW)
  - **Tests**:
    - Test create employee shows toast on validation error
    - Test update employee shows toast on server error
    - Test delete employee shows toast on failure
    - Test failed mutations don't invalidate cache
  - **Acceptance**: Toast notifications appear for all mutation failures
  - **Verification**: Run tests, verify toast calls

## Phase 7: Testing - E2E Tests (Effort: 45 min)

- [ ] 7.1 Write E2E test for orders page flow
  - **File**: `src/test/e2e/orders-flow.test.tsx` (NEW)
  - **Scenario**: Navigate to orders, see placeholders, data loads, paginate
  - **Acceptance**: User flow works end-to-end
  - **Verification**: Run E2E test

- [ ] 7.2 Write E2E test for dashboard stats (no polling)
  - **File**: `src/test/e2e/dashboard-no-polling.test.tsx` (NEW)
  - **Scenario**: Load dashboard, wait 60s, verify no automatic refetch
  - **Acceptance**: No polling occurs
  - **Verification**: Run E2E test with fake timers

- [ ] 7.3 Write E2E test for employee creation with error
  - **File**: `src/test/e2e/employee-error-handling.test.tsx` (NEW)
  - **Scenario**: Submit invalid employee form, see error toast
  - **Acceptance**: Error handling works in real browser
  - **Verification**: Run E2E test

## Phase 8: Verification & Smoke Testing (Effort: 45 min)

- [ ] 8.1 Manual testing with ReactQueryDevtools
  - **Steps**:
    - Start dev server: `pnpm dev`
    - Open DevTools panel
    - Navigate through all pages (Dashboard, Orders, Employees, Inventory)
    - Verify query keys are descriptive
    - Verify staleTime values match design
    - Verify cache behavior works correctly
  - **Acceptance**: DevTools show correct configuration, no unexpected query behavior
  - **Verification**: Manual testing checklist completed

- [ ] 8.2 Performance verification - measure request reduction
  - **Steps**:
    - Open browser DevTools Network tab
    - Navigate through pages multiple times
    - Count API requests before/after optimization
    - Verify ~30-40% reduction in redundant requests
  - **Acceptance**: Measurable reduction in API calls
  - **Verification**: Document request counts in test report

- [ ] 8.3 Smoke test all pages and features
  - **Pages to test**:
    - Dashboard - stats load correctly
    - Orders list - placeholders show, data loads, pagination works
    - Order detail - loads correctly
    - Pending orders - placeholders show, data loads
    - Employees - placeholders show, CRUD operations work
    - Inventory - placeholders show, search works
    - Stock search - debouncing works, minimum length enforced
  - **Acceptance**: All pages load without errors, UI works as expected
  - **Verification**: Complete smoke test checklist

- [ ] 8.4 Test error scenarios
  - **Scenarios**:
    - Disconnect network - verify retry attempts
    - Simulate 500 error - verify retry with backoff
    - Simulate 401 error - verify immediate logout (no retry)
    - Submit invalid data - verify toast error appears
  - **Acceptance**: Error handling works as designed
  - **Verification**: All error scenarios tested

- [ ] 8.5 Run full test suite
  - **Command**: `pnpm test`
  - **Acceptance**: All tests pass (unit, integration, E2E)
  - **Verification**: 100% test pass rate

## Phase 9: Documentation & Cleanup (Effort: 30 min)

- [ ] 9.1 Update AGENTS.md with new hook patterns
  - **File**: `AGENTS.md`
  - **Changes**: Document new query-config.ts usage, placeholder data pattern, centralized constants
  - **Acceptance**: Documentation updated with examples
  - **Verification**: Review AGENTS.md changes

- [ ] 9.2 Add JSDoc comments to all hooks
  - **Files**: All `src/hooks/*.ts` files
  - **Changes**: Ensure each hook has JSDoc explaining cache strategy, placeholders, retry behavior
  - **Acceptance**: All hooks documented
  - **Verification**: Run TypeScript check, no missing docs

- [ ] 9.3 Verify no console errors or warnings
  - **Steps**:
    - Run `pnpm build` - verify no build warnings
    - Start dev server - check browser console for errors
    - Check DevTools for React warnings
  - **Acceptance**: No errors or warnings in console
  - **Verification**: Clean console output

- [ ] 9.4 Create rollback verification test
  - **Steps**:
    - Document rollback procedure
    - Verify revert works by temporarily reverting App.tsx
    - Run tests - ensure all pass with old config
  - **Acceptance**: Rollback procedure documented and tested
  - **Verification**: Rollback document created

## Summary

**Total Phases**: 9
**Total Tasks**: 39
**Estimated Total Effort**: ~7.5 hours

### Task Distribution by Phase

| Phase     | Tasks  | Effort      | Focus                   |
| --------- | ------ | ----------- | ----------------------- |
| Phase 1   | 2      | 30 min      | Setup                   |
| Phase 2   | 3      | 45 min      | Core Configuration      |
| Phase 3   | 3      | 1 hr        | Core Hooks              |
| Phase 4   | 5      | 1 hr 15 min | Entity Management Hooks |
| Phase 5   | 3      | 1 hr 30 min | Unit Tests              |
| Phase 6   | 4      | 1 hr        | Integration Tests       |
| Phase 7   | 3      | 45 min      | E2E Tests               |
| Phase 8   | 5      | 45 min      | Verification            |
| Phase 9   | 4      | 30 min      | Documentation           |
| **Total** | **39** | **~7.5 hr** |                         |

### Critical Path

1.1 → 1.2 → 2.1 → 2.2 → 3.1-3.3 → 4.1-4.5 → 5.1-5.3 → 8.1-8.5

### Parallelizable Tasks

- Phase 3 tasks (3.1, 3.2, 3.3) can be done in parallel after Phase 2
- Phase 4 tasks (4.1-4.5) can be done in parallel after Phase 3
- Phase 5, 6, 7 tests can be written in parallel after hooks are updated

### Dependencies

- Phase 1 must complete before Phase 2 (need query-config.ts)
- Phase 2 must complete before Phases 3-4 (need QueryClient config)
- Phases 3-4 must complete before Phase 5 (hooks need updating before testing)
- Phase 8 depends on all previous phases (verification requires complete implementation)
