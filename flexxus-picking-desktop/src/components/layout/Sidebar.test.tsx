import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'

describe('Sidebar', () => {
  it('renders the completed orders navigation entry', () => {
    render(
      <MemoryRouter initialEntries={['/orders/completed']}>
        <Sidebar />
      </MemoryRouter>
    )

    const link = screen.getByRole('link', { name: /Completados/i })

    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/orders/completed')
  })
})
