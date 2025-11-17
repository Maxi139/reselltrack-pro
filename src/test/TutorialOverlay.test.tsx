import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TutorialOverlay from '@/components/TutorialOverlay'

const mockSteps = [
  {
    target: '#dashboard-stats',
    title: 'Welcome to Your Dashboard',
    content: 'This is where you can see all your key metrics at a glance.',
  },
  {
    target: '#products-section',
    title: 'Manage Your Products',
    content: 'Add, edit, and track all your products here.',
  },
  {
    target: '#meetings-section',
    title: 'Schedule Meetings',
    content: 'Keep track of all your client meetings and pickups.',
  },
]

// Mock getBoundingClientRect for tooltip positioning
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  top: 100,
  left: 100,
  bottom: 200,
  right: 300,
  width: 200,
  height: 100,
  x: 100,
  y: 100,
  toJSON: () => ({}),
}))

describe('TutorialOverlay', () => {
  it('renders nothing when not active', () => {
    const { container } = render(
      <TutorialOverlay isActive={false} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('renders first step when active', () => {
    // Create a mock element for the target
    const mockElement = document.createElement('div')
    mockElement.id = 'dashboard-stats'
    document.body.appendChild(mockElement)
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    expect(screen.getByText('Welcome to Your Dashboard')).toBeInTheDocument()
    expect(screen.getByText('This is where you can see all your key metrics at a glance.')).toBeInTheDocument()
    
    // Cleanup
    document.body.removeChild(mockElement)
  })

  it('shows step counter', () => {
    const mockElement = document.createElement('div')
    mockElement.id = 'dashboard-stats'
    document.body.appendChild(mockElement)
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    
    document.body.removeChild(mockElement)
  })

  it('navigates to next step', async () => {
    const user = userEvent.setup()
    
    // Create mock elements for both steps
    const firstElement = document.createElement('div')
    firstElement.id = 'dashboard-stats'
    document.body.appendChild(firstElement)
    
    const secondElement = document.createElement('div')
    secondElement.id = 'products-section'
    document.body.appendChild(secondElement)
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    // Click next button
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    
    // Should show second step
    await waitFor(() => {
      expect(screen.getByText('Manage Your Products')).toBeInTheDocument()
      expect(screen.getByText('Add, edit, and track all your products here.')).toBeInTheDocument()
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    })
    
    // Cleanup
    document.body.removeChild(firstElement)
    document.body.removeChild(secondElement)
  })

  it('navigates to previous step', async () => {
    const user = userEvent.setup()
    
    // Create mock elements
    const firstElement = document.createElement('div')
    firstElement.id = 'dashboard-stats'
    document.body.appendChild(firstElement)
    
    const secondElement = document.createElement('div')
    secondElement.id = 'products-section'
    document.body.appendChild(secondElement)
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    // Go to next step first
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)
    
    // Now go back
    const prevButton = screen.getByRole('button', { name: /previous/i })
    await user.click(prevButton)
    
    // Should show first step again
    await waitFor(() => {
      expect(screen.getByText('Welcome to Your Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    })
    
    // Cleanup
    document.body.removeChild(firstElement)
    document.body.removeChild(secondElement)
  })

  it('shows different button text on last step', async () => {
    const user = userEvent.setup()
    
    // Create mock elements for all steps
    mockSteps.forEach((step, index) => {
      const element = document.createElement('div')
      element.id = step.target.replace('#', '')
      document.body.appendChild(element)
    })
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    // Navigate to last step
    const nextButton = screen.getByRole('button', { name: /next/i })
    
    // Go to step 2
    await user.click(nextButton)
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    })
    
    // Go to step 3 (last step)
    await user.click(nextButton)
    await waitFor(() => {
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
    })
    
    // Should show "Complete" button instead of "Next"
    expect(screen.getByRole('button', { name: /complete/i })).toBeInTheDocument()
    
    // Cleanup
    mockSteps.forEach(step => {
      const element = document.getElementById(step.target.replace('#', ''))
      if (element) document.body.removeChild(element)
    })
  })

  it('calls onComplete when tutorial is finished', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    
    // Create mock elements for all steps
    mockSteps.forEach(step => {
      const element = document.createElement('div')
      element.id = step.target.replace('#', '')
      document.body.appendChild(element)
    })
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={onComplete} />
    )
    
    // Navigate to last step
    const nextButton = screen.getByRole('button', { name: /next/i })
    
    // Go through all steps
    for (let i = 0; i < mockSteps.length - 1; i++) {
      await user.click(nextButton)
      await waitFor(() => {
        expect(screen.getByText(`Step ${i + 2} of ${mockSteps.length}`)).toBeInTheDocument()
      })
    }
    
    // Click complete button
    const completeButton = screen.getByRole('button', { name: /complete/i })
    await user.click(completeButton)
    
    // Should call onComplete
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    })
    
    // Cleanup
    mockSteps.forEach(step => {
      const element = document.getElementById(step.target.replace('#', ''))
      if (element) document.body.removeChild(element)
    })
  })

  it('allows skipping tutorial', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    
    const mockElement = document.createElement('div')
    mockElement.id = 'dashboard-stats'
    document.body.appendChild(mockElement)
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={onComplete} />
    )
    
    // Click skip button
    const skipButton = screen.getByRole('button', { name: /skip tutorial/i })
    await user.click(skipButton)
    
    // Should call onComplete
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    })
    
    document.body.removeChild(mockElement)
  })

  it('handles missing target elements gracefully', () => {
    // Don't create any DOM elements
    
    const { container } = render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    // Should still render the tutorial content
    expect(screen.getByText('Welcome to Your Dashboard')).toBeInTheDocument()
    expect(container.firstChild).toBeTruthy()
  })

  it('positions tooltip correctly based on target element', () => {
    const mockElement = document.createElement('div')
    mockElement.id = 'dashboard-stats'
    document.body.appendChild(mockElement)
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    // The tooltip should be positioned relative to the mock element
    const tooltip = screen.getByRole('dialog')
    expect(tooltip).toBeInTheDocument()
    
    document.body.removeChild(mockElement)
  })

  it('shows progress indicator', () => {
    const mockElement = document.createElement('div')
    mockElement.id = 'dashboard-stats'
    document.body.appendChild(mockElement)
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    // Should show progress dots
    const progressDots = screen.getAllByRole('button', { name: /go to step/i })
    expect(progressDots.length).toBe(mockSteps.length)
    
    // First dot should be active
    expect(progressDots[0]).toHaveClass('bg-blue-600')
    
    document.body.removeChild(mockElement)
  })

  it('allows jumping to specific step', async () => {
    const user = userEvent.setup()
    
    // Create mock elements for all steps
    mockSteps.forEach(step => {
      const element = document.createElement('div')
      element.id = step.target.replace('#', '')
      document.body.appendChild(element)
    })
    
    render(
      <TutorialOverlay isActive={true} steps={mockSteps} onComplete={vi.fn()} />
    )
    
    // Click on third progress dot (step 3)
    const progressDots = screen.getAllByRole('button', { name: /go to step/i })
    await user.click(progressDots[2])
    
    // Should show step 3 content
    await waitFor(() => {
      expect(screen.getByText('Schedule Meetings')).toBeInTheDocument()
      expect(screen.getByText('Step 3 of 3')).toBeInTheDocument()
    })
    
    // Cleanup
    mockSteps.forEach(step => {
      const element = document.getElementById(step.target.replace('#', ''))
      if (element) document.body.removeChild(element)
    })
  })
})