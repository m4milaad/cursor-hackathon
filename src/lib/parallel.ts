/**
 * Parallel API Execution and Loading State Management
 * 
 * Provides utilities for:
 * - Executing independent API calls in parallel
 * - Managing loading states with fast feedback (<100ms)
 * - Optimizing critical path for <15 second workflows
 * 
 * Requirements: 16.3, 16.4, 16.5
 */

/**
 * Loading state manager
 */
export class LoadingStateManager {
  private loadingStates: Map<string, boolean> = new Map()
  private listeners: Map<string, Set<(loading: boolean) => void>> = new Map()
  private startTimes: Map<string, number> = new Map()

  /**
   * Set loading state for a key
   * Requirement 16.4: Loading state appears within 100ms
   */
  setLoading(key: string, loading: boolean): void {
    const wasLoading = this.loadingStates.get(key)
    
    if (loading && !wasLoading) {
      // Track start time for performance monitoring
      this.startTimes.set(key, Date.now())
    } else if (!loading && wasLoading) {
      // Calculate duration
      const startTime = this.startTimes.get(key)
      if (startTime) {
        const duration = Date.now() - startTime
        console.log(`[Performance] ${key} completed in ${duration}ms`)
        this.startTimes.delete(key)
      }
    }
    
    this.loadingStates.set(key, loading)
    this.notifyListeners(key, loading)
  }

  /**
   * Get loading state for a key
   */
  isLoading(key: string): boolean {
    return this.loadingStates.get(key) ?? false
  }

  /**
   * Subscribe to loading state changes
   */
  subscribe(key: string, listener: (loading: boolean) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(listener)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key)
      if (listeners) {
        listeners.delete(listener)
      }
    }
  }

  /**
   * Notify all listeners for a key
   */
  private notifyListeners(key: string, loading: boolean): void {
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(listener => listener(loading))
    }
  }

  /**
   * Clear all loading states
   */
  clear(): void {
    this.loadingStates.clear()
    this.startTimes.clear()
  }

  /**
   * Get all active loading keys
   */
  getActiveKeys(): string[] {
    return Array.from(this.loadingStates.entries())
      .filter(([, loading]) => loading)
      .map(([key]) => key)
  }
}

/**
 * Global loading state manager instance
 */
export const globalLoadingManager = new LoadingStateManager()

/**
 * Execute multiple async operations in parallel
 * Requirement 16.3: Execute independent API calls in parallel
 * 
 * @param operations - Array of async operations to execute
 * @returns Array of results in the same order as operations
 */
export async function executeParallel<T>(
  operations: Array<() => Promise<T>>
): Promise<T[]> {
  const startTime = Date.now()
  
  // Execute all operations in parallel
  const results = await Promise.all(operations.map(op => op()))
  
  const duration = Date.now() - startTime
  console.log(`[Performance] Parallel execution completed in ${duration}ms`)
  
  return results
}

/**
 * Execute operations in parallel with individual error handling
 * Failed operations return null instead of throwing
 * 
 * @param operations - Array of async operations to execute
 * @returns Array of results or null for failed operations
 */
export async function executeParallelSafe<T>(
  operations: Array<() => Promise<T>>
): Promise<Array<T | null>> {
  const startTime = Date.now()
  
  const results = await Promise.allSettled(operations.map(op => op()))
  
  const duration = Date.now() - startTime
  console.log(`[Performance] Safe parallel execution completed in ${duration}ms`)
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : null
  )
}

/**
 * Execute an operation with loading state management
 * Requirement 16.4: Loading state appears within 100ms
 * 
 * @param key - Unique key for this operation
 * @param operation - Async operation to execute
 * @param manager - Loading state manager (defaults to global)
 * @returns Result of the operation
 */
export async function withLoadingState<T>(
  key: string,
  operation: () => Promise<T>,
  manager: LoadingStateManager = globalLoadingManager
): Promise<T> {
  try {
    // Set loading state immediately (within 100ms requirement)
    manager.setLoading(key, true)
    
    // Execute operation
    const result = await operation()
    
    return result
  } finally {
    // Clear loading state
    manager.setLoading(key, false)
  }
}

/**
 * Execute multiple operations in parallel with loading states
 * 
 * @param operations - Map of key to async operation
 * @param manager - Loading state manager (defaults to global)
 * @returns Map of key to result
 */
export async function executeParallelWithLoading<T>(
  operations: Map<string, () => Promise<T>>,
  manager: LoadingStateManager = globalLoadingManager
): Promise<Map<string, T>> {
  const keys = Array.from(operations.keys())
  const ops = Array.from(operations.values())
  
  // Execute all with loading states
  const results = await Promise.all(
    ops.map((op, i) => withLoadingState(keys[i], op, manager))
  )
  
  // Build result map
  const resultMap = new Map<string, T>()
  keys.forEach((key, i) => {
    resultMap.set(key, results[i])
  })
  
  return resultMap
}

/**
 * Workflow optimizer for end-to-end performance
 * Requirement 16.5: Complete workflows within 15 seconds
 */
export class WorkflowOptimizer {
  private workflowStartTime: number | null = null
  private readonly targetDuration = 15000 // 15 seconds

  /**
   * Start tracking a workflow
   */
  startWorkflow(): void {
    this.workflowStartTime = Date.now()
  }

  /**
   * Get elapsed time since workflow start
   */
  getElapsedTime(): number {
    if (!this.workflowStartTime) return 0
    return Date.now() - this.workflowStartTime
  }

  /**
   * Get remaining time in workflow budget
   */
  getRemainingTime(): number {
    const elapsed = this.getElapsedTime()
    return Math.max(0, this.targetDuration - elapsed)
  }

  /**
   * Check if workflow is within time budget
   */
  isWithinBudget(): boolean {
    return this.getElapsedTime() <= this.targetDuration
  }

  /**
   * Complete workflow and log performance
   */
  completeWorkflow(workflowName: string): void {
    const duration = this.getElapsedTime()
    const withinBudget = duration <= this.targetDuration
    
    console.log(
      `[Performance] Workflow "${workflowName}" completed in ${duration}ms ` +
      `(${withinBudget ? 'PASS' : 'FAIL'} - target: ${this.targetDuration}ms)`
    )
    
    this.workflowStartTime = null
  }

  /**
   * Execute a workflow with performance tracking
   */
  async executeWorkflow<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.startWorkflow()
    try {
      const result = await operation()
      this.completeWorkflow(name)
      return result
    } catch (error) {
      this.completeWorkflow(name)
      throw error
    }
  }
}

/**
 * Optimize a workflow by executing independent steps in parallel
 * 
 * Example:
 * ```typescript
 * const result = await optimizeWorkflow('samjho', async () => {
 *   // Step 1: Compress image (must be first)
 *   const compressed = await compressImage(file)
 *   
 *   // Step 2 & 3: OCR and other operations in parallel
 *   const [ocrText, metadata] = await executeParallel([
 *     () => extractText(compressed),
 *     () => getMetadata(compressed)
 *   ])
 *   
 *   // Step 4: Generate explanation (depends on OCR)
 *   const explanation = await generateExplanation(ocrText)
 *   
 *   return explanation
 * })
 * ```
 */
export async function optimizeWorkflow<T>(
  name: string,
  workflow: () => Promise<T>
): Promise<T> {
  const optimizer = new WorkflowOptimizer()
  return optimizer.executeWorkflow(name, workflow)
}

/**
 * Create a debounced loading state setter
 * Ensures loading state appears quickly but doesn't flicker for fast operations
 * 
 * @param minDisplayTime - Minimum time to show loading state (default: 300ms)
 */
export function createDebouncedLoader(minDisplayTime = 300) {
  let loadingStartTime: number | null = null
  
  return {
    async execute<T>(
      key: string,
      operation: () => Promise<T>,
      manager: LoadingStateManager = globalLoadingManager
    ): Promise<T> {
      // Set loading immediately
      manager.setLoading(key, true)
      loadingStartTime = Date.now()
      
      try {
        const result = await operation()
        
        // Ensure loading state is shown for minimum time
        const elapsed = Date.now() - loadingStartTime
        if (elapsed < minDisplayTime) {
          await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsed))
        }
        
        return result
      } finally {
        manager.setLoading(key, false)
        loadingStartTime = null
      }
    }
  }
}

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Log performance metric
   */
  log(operation: string, duration: number, threshold?: number): void {
    const status = threshold && duration > threshold ? 'SLOW' : 'OK'
    console.log(`[Performance] ${operation}: ${duration}ms [${status}]`)
  },

  /**
   * Measure operation duration
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    threshold?: number
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.log(operation, duration, threshold)
      return result
    } catch (error) {
      const duration = Date.now() - start
      console.error(`[Performance] ${operation} failed after ${duration}ms`, error)
      throw error
    }
  }
}
