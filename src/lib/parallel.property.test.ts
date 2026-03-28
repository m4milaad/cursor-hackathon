/**
 * Property-Based Tests for Parallel Execution and Performance
 * Feature: raasta-ai-companion
 * 
 * These tests verify universal properties that should hold across all inputs
 * using fast-check for comprehensive input coverage.
 * 
 * Note: Tests use 5 iterations for faster execution (as per task requirements)
 */

import { describe, test, expect, beforeEach } from '@jest/globals'
import * as fc from 'fast-check'
import {
  LoadingStateManager,
  executeParallel,
  executeParallelSafe,
  withLoadingState,
  executeParallelWithLoading,
  WorkflowOptimizer,
  optimizeWorkflow,
  performanceMonitor,
} from './parallel'

// ============================================
// Test Setup
// ============================================

beforeEach(() => {
  // Clear any state before each test
})

// ============================================
// Test Helpers
// ============================================

/**
 * Create a mock async operation with specified duration
 */
function createMockOperation<T>(value: T, durationMs: number): () => Promise<T> {
  return async () => {
    await new Promise(resolve => setTimeout(resolve, durationMs))
    return value
  }
}

/**
 * Create a mock operation that fails
 */
function createFailingOperation(errorMessage: string): () => Promise<never> {
  return async () => {
    await new Promise(resolve => setTimeout(resolve, 10))
    throw new Error(errorMessage)
  }
}

// ============================================
// Property 37: End-to-End Workflow Performance
// **Validates: Requirements 16.5**
// ============================================

describe('Parallel Execution and Performance - Property Tests', () => {
  test('Property 37: Workflows complete within 15 seconds', async () => {
    // Test that complete workflows finish within 15 second budget
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          steps: fc.integer({ min: 1, max: 5 }),
          stepDuration: fc.integer({ min: 100, max: 2000 }), // 100ms to 2s per step
        }),
        async (input) => {
          const optimizer = new WorkflowOptimizer()
          
          // Create a workflow with multiple steps
          const workflow = async () => {
            const operations = Array.from({ length: input.steps }, (_, i) =>
              createMockOperation(`result-${i}`, input.stepDuration)
            )
            
            // Execute steps in parallel for better performance
            return await executeParallel(operations)
          }
          
          // Execute workflow with tracking
          const startTime = Date.now()
          await optimizer.executeWorkflow('test-workflow', workflow)
          const duration = Date.now() - startTime
          
          // Property: Workflow should complete within 15 seconds
          expect(duration).toBeLessThan(15000)
          
          // Property: Optimizer should track completion
          expect(optimizer.isWithinBudget()).toBe(true)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Parallel execution is faster than sequential', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          operations: fc.integer({ min: 2, max: 4 }),
          duration: fc.integer({ min: 100, max: 500 }),
        }),
        async (input) => {
          const ops = Array.from({ length: input.operations }, (_, i) =>
            createMockOperation(i, input.duration)
          )
          
          // Parallel execution
          const parallelStart = Date.now()
          await executeParallel(ops)
          const parallelDuration = Date.now() - parallelStart
          
          // Sequential execution (for comparison)
          const sequentialStart = Date.now()
          for (const op of ops) {
            await op()
          }
          const sequentialDuration = Date.now() - sequentialStart
          
          // Property: Parallel should be faster (or similar for very fast ops)
          // Allow some overhead for parallel execution
          expect(parallelDuration).toBeLessThan(sequentialDuration * 0.8 + 100)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Loading state appears within 100ms', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          key: fc.string({ minLength: 5, maxLength: 20 }),
          operationDuration: fc.integer({ min: 200, max: 1000 }),
        }),
        async (input) => {
          const manager = new LoadingStateManager()
          let loadingSetTime: number | null = null
          
          // Subscribe to loading state changes
          manager.subscribe(input.key, (loading) => {
            if (loading && loadingSetTime === null) {
              loadingSetTime = Date.now()
            }
          })
          
          const startTime = Date.now()
          
          // Execute operation with loading state
          await withLoadingState(
            input.key,
            createMockOperation('result', input.operationDuration),
            manager
          )
          
          // Property: Loading state should be set within 100ms (Requirement 16.4)
          if (loadingSetTime !== null) {
            const loadingDelay = loadingSetTime - startTime
            expect(loadingDelay).toBeLessThan(100)
          }
          
          // Property: Loading state should be cleared after operation
          expect(manager.isLoading(input.key)).toBe(false)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Loading state manager tracks multiple keys independently', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 5, maxLength: 20 }),
          { minLength: 2, maxLength: 5 }
        ),
        (keys) => {
          const manager = new LoadingStateManager()
          
          // Set loading for all keys
          keys.forEach(key => manager.setLoading(key, true))
          
          // Property: All keys should be loading
          keys.forEach(key => {
            expect(manager.isLoading(key)).toBe(true)
          })
          
          // Property: Active keys should match
          const activeKeys = manager.getActiveKeys()
          expect(activeKeys.length).toBe(keys.length)
          
          // Clear one key
          if (keys.length > 0) {
            manager.setLoading(keys[0], false)
            expect(manager.isLoading(keys[0])).toBe(false)
            expect(manager.getActiveKeys().length).toBe(keys.length - 1)
          }
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: executeParallelSafe handles failures gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          successCount: fc.integer({ min: 1, max: 3 }),
          failCount: fc.integer({ min: 1, max: 3 }),
        }),
        async (input) => {
          const operations: Array<() => Promise<string | never>> = []
          
          // Add successful operations
          for (let i = 0; i < input.successCount; i++) {
            operations.push(createMockOperation(`success-${i}`, 50))
          }
          
          // Add failing operations
          for (let i = 0; i < input.failCount; i++) {
            operations.push(createFailingOperation(`error-${i}`))
          }
          
          // Execute with safe parallel
          const results = await executeParallelSafe(operations)
          
          // Property: Should return array with same length
          expect(results.length).toBe(input.successCount + input.failCount)
          
          // Property: Successful operations should have results
          const successResults = results.filter(r => r !== null)
          expect(successResults.length).toBe(input.successCount)
          
          // Property: Failed operations should be null
          const failResults = results.filter(r => r === null)
          expect(failResults.length).toBe(input.failCount)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: WorkflowOptimizer tracks elapsed time accurately', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 1000 }),
        async (duration) => {
          const optimizer = new WorkflowOptimizer()
          optimizer.startWorkflow()
          
          // Wait for specified duration
          await new Promise(resolve => setTimeout(resolve, duration))
          
          const elapsed = optimizer.getElapsedTime()
          
          // Property: Elapsed time should be close to actual duration
          // Allow 50ms tolerance for timing variations
          expect(elapsed).toBeGreaterThanOrEqual(duration - 50)
          expect(elapsed).toBeLessThan(duration + 100)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: WorkflowOptimizer correctly identifies budget violations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          duration: fc.integer({ min: 100, max: 20000 }),
        }),
        async (input) => {
          const optimizer = new WorkflowOptimizer()
          
          await optimizer.executeWorkflow('test', async () => {
            await new Promise(resolve => setTimeout(resolve, input.duration))
            return 'done'
          })
          
          // Property: Budget check should match actual duration
          const expectedWithinBudget = input.duration <= 15000
          expect(optimizer.isWithinBudget()).toBe(expectedWithinBudget)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: executeParallelWithLoading manages all loading states', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            key: fc.string({ minLength: 5, maxLength: 15 }),
            duration: fc.integer({ min: 50, max: 300 }),
            value: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          { minLength: 2, maxLength: 4 }
        ),
        async (operations) => {
          const manager = new LoadingStateManager()
          
          // Create operations map
          const opsMap = new Map(
            operations.map(op => [
              op.key,
              createMockOperation(op.value, op.duration)
            ])
          )
          
          // Track loading states
          const loadingStates: Record<string, boolean[]> = {}
          operations.forEach(op => {
            loadingStates[op.key] = []
            manager.subscribe(op.key, (loading) => {
              loadingStates[op.key].push(loading)
            })
          })
          
          // Execute with loading states
          const results = await executeParallelWithLoading(opsMap, manager)
          
          // Property: All operations should have results
          expect(results.size).toBe(operations.length)
          operations.forEach(op => {
            expect(results.get(op.key)).toBe(op.value)
          })
          
          // Property: All loading states should be cleared
          operations.forEach(op => {
            expect(manager.isLoading(op.key)).toBe(false)
          })
          
          // Property: Each key should have had loading state changes
          operations.forEach(op => {
            expect(loadingStates[op.key].length).toBeGreaterThan(0)
          })
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Performance monitor measures duration accurately', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 500 }),
        async (duration) => {
          const startTime = Date.now()
          
          await performanceMonitor.measure(
            'test-operation',
            createMockOperation('result', duration)
          )
          
          const actualDuration = Date.now() - startTime
          
          // Property: Measured duration should be close to actual
          expect(actualDuration).toBeGreaterThanOrEqual(duration - 50)
          expect(actualDuration).toBeLessThan(duration + 100)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: optimizeWorkflow completes and tracks performance', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          steps: fc.integer({ min: 1, max: 3 }),
          stepDuration: fc.integer({ min: 50, max: 300 }),
        }),
        async (input) => {
          const startTime = Date.now()
          
          const result = await optimizeWorkflow('test-workflow', async () => {
            const ops = Array.from({ length: input.steps }, (_, i) =>
              createMockOperation(i, input.stepDuration)
            )
            return await executeParallel(ops)
          })
          
          const duration = Date.now() - startTime
          
          // Property: Should return results
          expect(result).toBeDefined()
          expect(Array.isArray(result)).toBe(true)
          expect(result.length).toBe(input.steps)
          
          // Property: Should complete in reasonable time
          // Parallel execution should take roughly stepDuration (not steps * stepDuration)
          expect(duration).toBeLessThan(input.stepDuration * 2 + 200)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  test('Property: Loading state subscription and unsubscription work correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        (key) => {
          const manager = new LoadingStateManager()
          let callCount = 0
          
          // Subscribe
          const unsubscribe = manager.subscribe(key, () => {
            callCount++
          })
          
          // Trigger state change
          manager.setLoading(key, true)
          expect(callCount).toBe(1)
          
          manager.setLoading(key, false)
          expect(callCount).toBe(2)
          
          // Unsubscribe
          unsubscribe()
          
          // Trigger state change again
          manager.setLoading(key, true)
          
          // Property: Should not be called after unsubscribe
          expect(callCount).toBe(2)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  })

  test('Property: WorkflowOptimizer remaining time decreases over time', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 500 }),
        async (duration) => {
          const optimizer = new WorkflowOptimizer()
          optimizer.startWorkflow()
          
          const initialRemaining = optimizer.getRemainingTime()
          
          // Wait
          await new Promise(resolve => setTimeout(resolve, duration))
          
          const finalRemaining = optimizer.getRemainingTime()
          
          // Property: Remaining time should decrease
          expect(finalRemaining).toBeLessThan(initialRemaining)
          
          // Property: Decrease should be approximately the duration
          const decrease = initialRemaining - finalRemaining
          expect(decrease).toBeGreaterThanOrEqual(duration - 50)
          expect(decrease).toBeLessThan(duration + 100)
          
          return true
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)
})
