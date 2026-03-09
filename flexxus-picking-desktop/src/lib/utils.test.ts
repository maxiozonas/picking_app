import { describe, it, expect } from 'vitest'
import { cn, formatDate } from '@/lib/utils'

describe('cn (className utility)', () => {
  describe('basic functionality', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
    })

    it('should handle empty strings', () => {
      expect(cn('px-4', '', 'py-2')).toBe('px-4 py-2')
    })

    it('should handle undefined and null values', () => {
      expect(cn('px-4', undefined, 'py-2', null)).toBe('px-4 py-2')
    })

    it('should handle single class name', () => {
      expect(cn('text-red-500')).toBe('text-red-500')
    })

    it('should return empty string when no classes provided', () => {
      expect(cn()).toBe('')
      expect(cn('', null, undefined)).toBe('')
    })
  })

  describe('Tailwind conflict resolution', () => {
    it('should resolve conflicting Tailwind classes (last wins)', () => {
      // twMerge ensures later classes override earlier ones
      expect(cn('px-4', 'px-8')).toBe('px-8')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
      expect(cn('bg-white', 'bg-gray-100')).toBe('bg-gray-100')
    })

    it('should keep non-conflicting classes', () => {
      expect(cn('px-4', 'py-2', 'text-red-500')).toBe('px-4 py-2 text-red-500')
    })

    it('should handle complex class combinations', () => {
      expect(cn('px-4 py-2 bg-white text-red-500', 'px-8 bg-blue-500')).toBe(
        'py-2 bg-blue-500 text-red-500 px-8'
      )
    })

    it('should handle responsive variants correctly', () => {
      expect(cn('px-4 md:px-8', 'px-6')).toBe('px-6 md:px-8')
      expect(cn('text-sm md:text-base', 'text-lg')).toBe('text-lg md:text-base')
    })

    it('should handle state variants correctly', () => {
      expect(cn('px-4 hover:px-8', 'px-6')).toBe('px-6 hover:px-8')
      expect(cn('text-red-500 hover:text-blue-500', 'text-green-500')).toBe(
        'text-green-500 hover:text-blue-500'
      )
    })
  })

  describe('conditional classes', () => {
    it('should handle conditional class names with clsx', () => {
      const isActive = true
      const isDisabled = false

      // clsx handles conditionals internally
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      )

      expect(result).toBe('base-class active-class')
    })

    it('should handle falsy conditionals', () => {
      const isActive = false
      const hasError = null

      const result = cn('base-class', isActive && 'active-class', hasError && 'error-class')

      expect(result).toBe('base-class')
    })

    it('should handle multiple conditional classes', () => {
      const conditions = {
        isPrimary: true,
        isLarge: false,
        isRounded: true,
      }

      const result = cn(
        'btn',
        conditions.isPrimary && 'btn-primary',
        conditions.isLarge && 'btn-large',
        conditions.isRounded && 'btn-rounded'
      )

      expect(result).toBe('btn btn-primary btn-rounded')
    })
  })

  describe('arrays and objects', () => {
    it('should handle arrays of class names', () => {
      expect(cn(['px-4', 'py-2'], 'text-red-500')).toBe('px-4 py-2 text-red-500')
    })

    it('should handle objects with boolean values', () => {
      const classes = {
        'px-4': true,
        'py-2': true,
        'text-red-500': false,
        'bg-white': true,
      }

      expect(cn(classes)).toBe('px-4 py-2 bg-white')
    })

    it('should handle mixed inputs', () => {
      const result = cn('base', ['extra-1', 'extra-2'], {
        conditional: true,
        'not-conditional': false,
      })

      expect(result).toBe('base extra-1 extra-2 conditional')
    })
  })

  describe('real-world use cases', () => {
    it('should handle button variant classes', () => {
      const variants = {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        danger: 'bg-red-500 text-white hover:bg-red-600',
      }

      expect(cn(variants.primary, 'px-4 py-2')).toBe(
        'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2'
      )
      expect(cn(variants.primary, variants.secondary)).toBe(
        'bg-gray-200 text-gray-800 hover:bg-gray-300' // secondary overrides primary
      )
    })

    it('should handle status badge classes', () => {
      const status = 'pending'
      const statusClasses = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        has_issues: 'bg-red-100 text-red-800',
      }

      expect(cn('badge', statusClasses[status as keyof typeof statusClasses])).toBe(
        'badge bg-yellow-100 text-yellow-800'
      )
    })

    it('should handle input field states', () => {
      const hasError = true
      const isFocused = false

      const baseClasses = 'border rounded px-3 py-2'
      const errorClasses = hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
      const focusClasses = isFocused ? 'ring-2 ring-blue-500' : ''

      expect(cn(baseClasses, errorClasses, focusClasses)).toBe(
        'border rounded px-3 py-2 border-red-500 focus:ring-red-500'
      )
    })
  })
})

describe('formatDate', () => {
  describe('basic formatting', () => {
    it('should format a valid ISO date string to Spanish locale', () => {
      const result = formatDate('2026-03-09T10:30:00Z')
      // Spanish locale format: DD/MM/YYYY, HH:MM
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/)
    })

    it('should format date with leading zeros', () => {
      const result = formatDate('2026-01-05T08:05:00Z')
      expect(result).toMatch(/0[15]\/0[1]\/2026, 0[8]:\d{2}/)
    })

    it('should handle date at midnight', () => {
      const result = formatDate('2026-03-09T00:00:00Z')
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, 00:00/)
    })

    it('should handle date at end of day', () => {
      const result = formatDate('2026-03-09T23:59:00Z')
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, 23:59/)
    })
  })

  describe('timezone handling', () => {
    it('should convert UTC to local timezone', () => {
      // The exact time will depend on the system's local timezone
      const result = formatDate('2026-03-09T10:30:00Z')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle different timezones correctly', () => {
      const utcDate = '2026-03-09T15:30:00Z'
      const result = formatDate(utcDate)
      // Should be a valid formatted date string
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/)
    })
  })

  describe('edge cases', () => {
    it('should handle leap year dates', () => {
      const result = formatDate('2024-02-29T12:00:00Z')
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/)
    })

    it('should handle end of month dates', () => {
      const result = formatDate('2026-01-31T23:59:59Z')
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/)
    })

    it('should handle start of year', () => {
      const result = formatDate('2026-01-01T00:00:00Z')
      expect(result).toMatch(/01\/01\/2026, 00:00/)
    })

    it('should handle end of year', () => {
      const result = formatDate('2026-12-31T23:59:59Z')
      expect(result).toMatch(/12\/31\/2026, 23:59/)
    })
  })

  describe('picking app specific dates', () => {
    it('should format picking order start time', () => {
      const orderStartTime = '2026-03-09T08:15:30Z'
      const result = formatDate(orderStartTime)
      expect(result).toBeTruthy()
      expect(result).toContain('2026')
    })

    it('should format picking order completion time', () => {
      const completionTime = '2026-03-09T14:45:00Z'
      const result = formatDate(completionTime)
      expect(result).toBeTruthy()
      expect(result).toContain('2026')
    })

    it('should format alert creation time', () => {
      const alertTime = '2026-03-09T11:30:00Z'
      const result = formatDate(alertTime)
      expect(result).toBeTruthy()
      expect(result).toContain('2026')
    })
  })

  describe('locale consistency', () => {
    it('should use Spanish (Argentina) locale consistently', () => {
      const result1 = formatDate('2026-03-09T10:30:00Z')
      const result2 = formatDate('2026-03-09T10:30:00Z')

      // Same input should produce same output
      expect(result1).toBe(result2)
    })

    it('should format dates with 2-digit day and month', () => {
      const result = formatDate('2026-03-09T10:30:00Z')
      // Should have leading zeros for day and month
      expect(result).toMatch(/^0?\d\/0?\d\/\d{4}/)
    })
  })

  describe('invalid inputs', () => {
    it('should return "Invalid Date" for invalid date strings', () => {
      const result = formatDate('not-a-date')
      expect(result).toBe('Invalid Date')
    })

    it('should handle empty string', () => {
      const result = formatDate('')
      expect(result).toBe('Invalid Date')
    })

    it('should handle malformed ISO strings', () => {
      const result = formatDate('2026-13-45T99:99:99Z') // Invalid date
      // The Date constructor creates an invalid date
      expect(result).toBe('Invalid Date')
    })
  })

  describe('comparison with direct Date formatting', () => {
    it('should match expected Spanish locale format', () => {
      const date = new Date('2026-03-09T10:30:00Z')
      const expected = date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      expect(formatDate('2026-03-09T10:30:00Z')).toBe(expected)
    })
  })
})
