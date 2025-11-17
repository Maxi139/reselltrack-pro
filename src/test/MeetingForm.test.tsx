import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MeetingForm from '@/components/MeetingForm'
import { Meeting } from '@/types'

const mockMeeting: Meeting = {
  id: '1',
  title: 'Product Pickup',
  client_name: 'John Doe',
  client_email: 'john@example.com',
  client_phone: '123-456-7890',
  scheduled_date: '2024-01-15',
  scheduled_time: '14:30',
  duration: 60,
  location: '123 Main St, City',
  meeting_type: 'pickup',
  status: 'scheduled',
  notes: 'Bring the item in original packaging',
  product_id: 'product123',
  user_id: 'user123',
  reminder_sent: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockProducts = [
  { id: 'product123', name: 'Vintage Watch' },
  { id: 'product456', name: 'Antique Vase' },
]

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: mockMeeting, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: mockMeeting, error: null })),
          })),
        })),
      })),
    })),
  },
}))

describe('MeetingForm', () => {
  it('renders form fields correctly', () => {
    render(<MeetingForm />)
    
    expect(screen.getByLabelText(/meeting title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/client email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/client phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/meeting type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/related product/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
  })

  it('pre-fills form when editing existing meeting', () => {
    render(<MeetingForm meeting={mockMeeting} products={mockProducts} />)
    
    expect(screen.getByLabelText(/meeting title/i)).toHaveValue('Product Pickup')
    expect(screen.getByLabelText(/client name/i)).toHaveValue('John Doe')
    expect(screen.getByLabelText(/client email/i)).toHaveValue('john@example.com')
    expect(screen.getByLabelText(/client phone/i)).toHaveValue('123-456-7890')
    expect(screen.getByLabelText(/date/i)).toHaveValue('2024-01-15')
    expect(screen.getByLabelText(/time/i)).toHaveValue('14:30')
    expect(screen.getByLabelText(/duration/i)).toHaveValue(60)
    expect(screen.getByLabelText(/location/i)).toHaveValue('123 Main St, City')
    expect(screen.getByLabelText(/notes/i)).toHaveValue('Bring the item in original packaging')
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<MeetingForm />)
    
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/meeting title is required/i)).toBeInTheDocument()
      expect(screen.getByText(/client name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/date is required/i)).toBeInTheDocument()
      expect(screen.getByText(/time is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<MeetingForm />)
    
    const emailInput = screen.getByLabelText(/client email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('allows empty optional email', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(<MeetingForm onSuccess={onSuccess} />)
    
    await user.type(screen.getByLabelText(/meeting title/i), 'Test Meeting')
    await user.type(screen.getByLabelText(/client name/i), 'John Doe')
    await user.type(screen.getByLabelText(/date/i), '2024-01-15')
    await user.type(screen.getByLabelText(/time/i), '14:30')
    
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('handles form submission successfully', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(<MeetingForm onSuccess={onSuccess} products={mockProducts} />)
    
    await user.type(screen.getByLabelText(/meeting title/i), 'New Meeting')
    await user.type(screen.getByLabelText(/client name/i), 'Jane Smith')
    await user.type(screen.getByLabelText(/client email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/client phone/i), '987-654-3210')
    await user.type(screen.getByLabelText(/date/i), '2024-01-20')
    await user.type(screen.getByLabelText(/time/i), '16:00')
    await user.selectOptions(screen.getByLabelText(/duration/i), '90')
    await user.type(screen.getByLabelText(/location/i), '456 Oak Ave, Town')
    await user.selectOptions(screen.getByLabelText(/meeting type/i), 'viewing')
    await user.selectOptions(screen.getByLabelText(/status/i), 'scheduled')
    await user.selectOptions(screen.getByLabelText(/related product/i), 'product123')
    await user.type(screen.getByLabelText(/notes/i), 'Important meeting notes')
    
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockMeeting)
    })
  })

  it('disables submit button during submission', async () => {
    const user = userEvent.setup()
    render(<MeetingForm />)
    
    await user.type(screen.getByLabelText(/meeting title/i), 'Test Meeting')
    await user.type(screen.getByLabelText(/client name/i), 'John Doe')
    await user.type(screen.getByLabelText(/date/i), '2024-01-15')
    await user.type(screen.getByLabelText(/time/i), '14:30')
    
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i })
    
    // Click submit
    await user.click(submitButton)
    
    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('shows correct button text for editing', () => {
    render(<MeetingForm meeting={mockMeeting} />)
    
    expect(screen.getByRole('button', { name: /update meeting/i })).toBeInTheDocument()
  })

  it('handles character limits correctly', async () => {
    const user = userEvent.setup()
    render(<MeetingForm />)
    
    const titleInput = screen.getByLabelText(/meeting title/i)
    const longTitle = 'a'.repeat(101)
    
    await user.type(titleInput, longTitle)
    
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/title too long/i)).toBeInTheDocument()
    })
  })

  it('handles phone number input', async () => {
    const user = userEvent.setup()
    render(<MeetingForm />)
    
    const phoneInput = screen.getByLabelText(/client phone/i)
    await user.type(phoneInput, '123-456-7890')
    
    expect(phoneInput).toHaveValue('123-456-7890')
  })

  it('handles notes character limit', async () => {
    const user = userEvent.setup()
    render(<MeetingForm />)
    
    const notesInput = screen.getByLabelText(/notes/i)
    const longNotes = 'a'.repeat(1001)
    
    await user.type(notesInput, longNotes)
    
    const submitButton = screen.getByRole('button', { name: /schedule meeting/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/notes too long/i)).toBeInTheDocument()
    })
  })

  it('handles duration selection', async () => {
    const user = userEvent.setup()
    render(<MeetingForm />)
    
    const durationSelect = screen.getByLabelText(/duration/i)
    await user.selectOptions(durationSelect, '120')
    
    expect(durationSelect).toHaveValue('120')
  })

  it('handles meeting type selection', async () => {
    const user = userEvent.setup()
    render(<MeetingForm />)
    
    const meetingTypeSelect = screen.getByLabelText(/meeting type/i)
    await user.selectOptions(meetingTypeSelect, 'negotiation')
    
    expect(meetingTypeSelect).toHaveValue('negotiation')
  })

  it('handles status selection', async () => {
    const user = userEvent.setup()
    render(<MeetingForm />)
    
    const statusSelect = screen.getByLabelText(/status/i)
    await user.selectOptions(statusSelect, 'completed')
    
    expect(statusSelect).toHaveValue('completed')
  })

  it('handles product selection', async () => {
    const user = userEvent.setup()
    render(<MeetingForm products={mockProducts} />)
    
    const productSelect = screen.getByLabelText(/related product/i)
    await user.selectOptions(productSelect, 'product123')
    
    expect(productSelect).toHaveValue('product123')
  })
})