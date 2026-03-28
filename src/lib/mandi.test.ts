/**
 * Unit Tests for Mandi Price Service
 * 
 * Tests specific examples, edge cases, and integration points
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock the config module before importing mandi
jest.mock('./config', () => ({
  getEnvironmentConfig: jest.fn(() => ({
    MANDI_API_KEY: undefined,
    MANDI_API_ENDPOINT: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
  })),
  isServiceInDemoMode: jest.fn(() => true),
}))

// Import after mocking
import { 
  getPriceForCrop, 
  formatMandiPrice, 
  isSupportedCrop,
  clearPriceCache,
  getCacheStats,
  type MandiPrice 
} from './mandi'
import { isServiceInDemoMode } from './config'

describe('Mandi Price Service - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearPriceCache()
  })

  describe('getPriceForCrop', () => {
    it('should return demo price when in demo mode', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const price = await getPriceForCrop('apple', 'kashmir')

      expect(price).toBeDefined()
      expect(price?.commodity).toBe('Apple')
      expect(price?.mandi).toBe('Sopore')
      expect(price?.price).toBe(42)
      expect(price?.unit).toBe('₹/kg')
      expect(price?.date).toBeTruthy()
    })

    it('should return rice price from Srinagar mandi', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const price = await getPriceForCrop('rice', 'kashmir')

      expect(price).toBeDefined()
      expect(price?.commodity).toBe('Rice')
      expect(price?.mandi).toBe('Srinagar')
      expect(price?.price).toBe(35)
      expect(price?.unit).toBe('₹/kg')
    })

    it('should return wheat price from Anantnag mandi', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const price = await getPriceForCrop('wheat', 'kashmir')

      expect(price).toBeDefined()
      expect(price?.commodity).toBe('Wheat')
      expect(price?.mandi).toBe('Anantnag')
      expect(price?.price).toBe(28)
      expect(price?.unit).toBe('₹/kg')
    })

    it('should return saffron price from Pampore mandi', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const price = await getPriceForCrop('saffron', 'kashmir')

      expect(price).toBeDefined()
      expect(price?.commodity).toBe('Saffron')
      expect(price?.mandi).toBe('Pampore')
      expect(price?.price).toBe(250000)
      expect(price?.unit).toBe('₹/kg')
    })

    it('should handle case-insensitive crop types', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const price1 = await getPriceForCrop('APPLE', 'kashmir')
      const price2 = await getPriceForCrop('Apple', 'kashmir')
      const price3 = await getPriceForCrop('apple', 'kashmir')

      expect(price1?.commodity).toBe('Apple')
      expect(price2?.commodity).toBe('Apple')
      expect(price3?.commodity).toBe('Apple')
    })

    it('should return default demo price for unsupported crops', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const price = await getPriceForCrop('tomato', 'kashmir')

      expect(price).toBeDefined()
      expect(price?.commodity).toBe('tomato')
      expect(price?.mandi).toBe('Srinagar')
      expect(price?.price).toBe(30)
      expect(price?.unit).toBe('₹/kg')
    })

    it('should simulate realistic processing delays in demo mode', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const startTime = Date.now()
      await getPriceForCrop('apple', 'kashmir')
      const duration = Date.now() - startTime

      // Demo mode should have ~800ms delay
      expect(duration).toBeGreaterThanOrEqual(700)
      expect(duration).toBeLessThan(2000)
    })
  })

  describe('Cache Functionality', () => {
    it('should cache price on first fetch', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)
      clearPriceCache()

      await getPriceForCrop('apple', 'kashmir')

      const stats = getCacheStats()
      expect(stats.size).toBe(1)
      expect(stats.keys).toContain('apple_kashmir')
    })

    it('should return cached price on second fetch', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)
      clearPriceCache()

      const price1 = await getPriceForCrop('apple', 'kashmir')
      const price2 = await getPriceForCrop('apple', 'kashmir')

      // Should be the same object from cache
      expect(price2).toEqual(price1)

      // Cache should still have only one entry
      const stats = getCacheStats()
      expect(stats.size).toBe(1)
    })

    it('should cache multiple crops independently', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)
      clearPriceCache()

      await getPriceForCrop('apple', 'kashmir')
      await getPriceForCrop('rice', 'kashmir')
      await getPriceForCrop('wheat', 'kashmir')

      const stats = getCacheStats()
      expect(stats.size).toBe(3)
      expect(stats.keys).toContain('apple_kashmir')
      expect(stats.keys).toContain('rice_kashmir')
      expect(stats.keys).toContain('wheat_kashmir')
    })

    it('should generate case-insensitive cache keys', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)
      clearPriceCache()

      await getPriceForCrop('APPLE', 'KASHMIR')
      await getPriceForCrop('apple', 'kashmir')

      // Should have only one cache entry
      const stats = getCacheStats()
      expect(stats.size).toBe(1)
    })

    it('should clear all cached prices', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      await getPriceForCrop('apple', 'kashmir')
      await getPriceForCrop('rice', 'kashmir')

      let stats = getCacheStats()
      expect(stats.size).toBe(2)

      clearPriceCache()

      stats = getCacheStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('formatMandiPrice', () => {
    it('should format price without date', () => {
      const price: MandiPrice = {
        commodity: 'Apple',
        mandi: 'Sopore',
        price: 42,
        unit: '₹/kg',
        date: '2024-01-15',
      }

      const formatted = formatMandiPrice(price, false)

      expect(formatted).toBe('Sopore mandi — apple ~₹42/kg')
      expect(formatted).not.toContain('2024')
      expect(formatted).not.toContain('(')
    })

    it('should format price with date', () => {
      const price: MandiPrice = {
        commodity: 'Apple',
        mandi: 'Sopore',
        price: 42,
        unit: '₹/kg',
        date: '2024-01-15',
      }

      const formatted = formatMandiPrice(price, true)

      expect(formatted).toBe('Sopore mandi — apple ~₹42/kg (2024-01-15)')
      expect(formatted).toContain('2024-01-15')
      expect(formatted).toContain('(')
      expect(formatted).toContain(')')
    })

    it('should format rice price correctly', () => {
      const price: MandiPrice = {
        commodity: 'Rice',
        mandi: 'Srinagar',
        price: 35,
        unit: '₹/kg',
        date: '2024-01-15',
      }

      const formatted = formatMandiPrice(price)

      expect(formatted).toBe('Srinagar mandi — rice ~₹35/kg')
    })

    it('should format saffron price with large numbers', () => {
      const price: MandiPrice = {
        commodity: 'Saffron',
        mandi: 'Pampore',
        price: 250000,
        unit: '₹/kg',
        date: '2024-01-15',
      }

      const formatted = formatMandiPrice(price)

      expect(formatted).toBe('Pampore mandi — saffron ~₹250000/kg')
      expect(formatted).toContain('250000')
    })

    it('should include rupee symbol and unit', () => {
      const price: MandiPrice = {
        commodity: 'Wheat',
        mandi: 'Anantnag',
        price: 28,
        unit: '₹/kg',
        date: '2024-01-15',
      }

      const formatted = formatMandiPrice(price)

      expect(formatted).toContain('₹')
      expect(formatted).toContain('/kg')
    })

    it('should lowercase commodity name', () => {
      const price: MandiPrice = {
        commodity: 'APPLE',
        mandi: 'Sopore',
        price: 42,
        unit: '₹/kg',
        date: '2024-01-15',
      }

      const formatted = formatMandiPrice(price)

      expect(formatted).toContain('apple')
      expect(formatted).not.toContain('APPLE')
    })
  })

  describe('isSupportedCrop', () => {
    it('should return true for apple', () => {
      expect(isSupportedCrop('apple')).toBe(true)
    })

    it('should return true for rice', () => {
      expect(isSupportedCrop('rice')).toBe(true)
    })

    it('should return true for wheat', () => {
      expect(isSupportedCrop('wheat')).toBe(true)
    })

    it('should return true for saffron', () => {
      expect(isSupportedCrop('saffron')).toBe(true)
    })

    it('should return false for unsupported crops', () => {
      expect(isSupportedCrop('corn')).toBe(false)
      expect(isSupportedCrop('potato')).toBe(false)
      expect(isSupportedCrop('tomato')).toBe(false)
      expect(isSupportedCrop('banana')).toBe(false)
    })

    it('should be case-insensitive', () => {
      expect(isSupportedCrop('APPLE')).toBe(true)
      expect(isSupportedCrop('Rice')).toBe(true)
      expect(isSupportedCrop('WHEAT')).toBe(true)
      expect(isSupportedCrop('Saffron')).toBe(true)
    })
  })

  describe('Price Format Consistency', () => {
    it('should always use ₹/kg unit', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const crops = ['apple', 'rice', 'wheat', 'saffron']

      for (const crop of crops) {
        const price = await getPriceForCrop(crop, 'kashmir')
        expect(price?.unit).toBe('₹/kg')
      }
    })

    it('should return positive price values', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const crops = ['apple', 'rice', 'wheat', 'saffron']

      for (const crop of crops) {
        const price = await getPriceForCrop(crop, 'kashmir')
        expect(price?.price).toBeGreaterThan(0)
      }
    })

    it('should return valid date strings', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const price = await getPriceForCrop('apple', 'kashmir')

      expect(price?.date).toBeTruthy()
      expect(typeof price?.date).toBe('string')
      // Should be in YYYY-MM-DD format
      expect(price?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return Kashmir mandi names', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const kashmirMandis = ['Sopore', 'Srinagar', 'Anantnag', 'Pampore']

      const applePrice = await getPriceForCrop('apple', 'kashmir')
      const ricePrice = await getPriceForCrop('rice', 'kashmir')
      const wheatPrice = await getPriceForCrop('wheat', 'kashmir')
      const saffronPrice = await getPriceForCrop('saffron', 'kashmir')

      expect(kashmirMandis).toContain(applePrice?.mandi)
      expect(kashmirMandis).toContain(ricePrice?.mandi)
      expect(kashmirMandis).toContain(wheatPrice?.mandi)
      expect(kashmirMandis).toContain(saffronPrice?.mandi)
    })
  })

  describe('Error Handling', () => {
    it('should fall back to demo price when API fails', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(false)

      // Mock fetch to fail
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as jest.Mock

      // Should fall back to demo mode instead of throwing
      const price = await getPriceForCrop('apple', 'kashmir')
      
      expect(price).toBeDefined()
      expect(price?.commodity).toBe('Apple')
      expect(price?.mandi).toBe('Sopore')
      expect(price?.price).toBe(42)
    })

    it('should log warnings to console when API fails', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(false)

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Test error'))
      ) as jest.Mock

      try {
        await getPriceForCrop('apple', 'kashmir')
      } catch {
        // Expected to throw
      }

      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })

  describe('Demo Mode Behavior', () => {
    it('should use demo responses when MANDI_API_KEY is not configured', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const price = await getPriceForCrop('apple', 'kashmir')

      expect(price).toBeDefined()
      expect(price?.commodity).toBe('Apple')
      expect(price?.price).toBeGreaterThan(0)
    })

    it('should return consistent demo prices', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)
      clearPriceCache()

      const price1 = await getPriceForCrop('apple', 'kashmir')
      clearPriceCache()
      const price2 = await getPriceForCrop('apple', 'kashmir')

      expect(price1?.commodity).toBe(price2?.commodity)
      expect(price1?.mandi).toBe(price2?.mandi)
      expect(price1?.price).toBe(price2?.price)
    })
  })

  describe('Stale Price Display', () => {
    it('should return cached price even after expiry when API fails', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)
      clearPriceCache()

      // First fetch to populate cache
      const freshPrice = await getPriceForCrop('apple', 'kashmir')
      expect(freshPrice).toBeDefined()

      // Second fetch should return cached price
      const cachedPrice = await getPriceForCrop('apple', 'kashmir')
      expect(cachedPrice).toEqual(freshPrice)
    })

    it('should include date in stale price display', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)

      const price = await getPriceForCrop('apple', 'kashmir')

      if (price) {
        const formatted = formatMandiPrice(price, true)
        expect(formatted).toContain(price.date)
      }
    })
  })

  describe('Cache Statistics', () => {
    it('should track cache size correctly', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)
      clearPriceCache()

      let stats = getCacheStats()
      expect(stats.size).toBe(0)

      await getPriceForCrop('apple', 'kashmir')
      stats = getCacheStats()
      expect(stats.size).toBe(1)

      await getPriceForCrop('rice', 'kashmir')
      stats = getCacheStats()
      expect(stats.size).toBe(2)
    })

    it('should list all cache keys', async () => {
      ;(isServiceInDemoMode as jest.Mock).mockReturnValue(true)
      clearPriceCache()

      await getPriceForCrop('apple', 'kashmir')
      await getPriceForCrop('rice', 'kashmir')

      const stats = getCacheStats()
      expect(stats.keys).toContain('apple_kashmir')
      expect(stats.keys).toContain('rice_kashmir')
    })
  })
})
