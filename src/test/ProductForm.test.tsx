import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductForm from '@/components/ProductForm'
import { Product } from '@/types'

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test description',
  category: 'Electronics',
  listing_price: 100,
  purchase_price: 50,
  platform: 'eBay',
  status: 'listed',
  condition: 'good',
  tags: ['test', 'electronics'],
  notes: 'Test notes',
  user_id: 'user123',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'test-image.jpg' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/test-image.jpg' } }))
      }))
    }
  }
}))

describe('ProductForm', () => {
  it('renders all form fields', () => {
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    
    expect(screen.getByText(/product images/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter product name/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: '' })).toBeInTheDocument() // Category select
    expect(screen.getAllByPlaceholderText(/0\.00/i)).toHaveLength(2) // Listing and purchase price
    expect(screen.getByPlaceholderText(/optional/i)).toBeInTheDocument() // Purchase price
    expect(screen.getAllByRole('combobox')).toHaveLength(4) // Category, Platform, Condition, Status
    expect(screen.getByPlaceholderText(/enter tags separated by commas/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/add any additional notes/i)).toBeInTheDocument()
  })

  it('pre-fills form when editing existing product', () => {
    render(<ProductForm product={mockProduct} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    
    expect(screen.getByPlaceholderText(/enter product name/i)).toHaveValue('Test Product')
    expect(screen.getByPlaceholderText(/describe your product/i)).toHaveValue('Test description')
    
    const priceInputs = screen.getAllByPlaceholderText(/0\.00/i)
    expect(priceInputs[0]).toHaveValue(100) // Listing price
    expect(priceInputs[1]).toHaveValue(50) // Purchase price
    
    expect(screen.getByPlaceholderText(/enter tags separated by commas/i)).toHaveValue('test, electronics')
    expect(screen.getByPlaceholderText(/add any additional notes/i)).toHaveValue('Test notes')
  })

  it('calculates profit margin correctly', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    
    const priceInputs = screen.getAllByPlaceholderText(/0\.00/i)
    const listingPriceInput = priceInputs[0]
    const purchasePriceInput = priceInputs[1]
    
    await user.type(listingPriceInput, '200')
    await user.type(purchasePriceInput, '100')
    
    await waitFor(() => {
      expect(screen.getByText(/profit: \$100\.00/i)).toBeInTheDocument()
      expect(screen.getByText(/margin: 50\.0%/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    
    const submitButton = screen.getByRole('button', { name: /create product/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/product name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/listing price must be positive/i)).toBeInTheDocument()
    })
  })

  it('validates price inputs correctly', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    
    const priceInputs = screen.getAllByPlaceholderText(/0\.00/i)
    const listingPriceInput = priceInputs[0]
    
    // Test negative price
    await user.type(listingPriceInput, '-50')
    
    const submitButton = screen.getByRole('button', { name: /create product/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/listing price must be positive/i)).toBeInTheDocument()
    })
  })

  it('handles form submission successfully', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    
    await user.type(screen.getByPlaceholderText(/enter product name/i), 'New Product')
    
    // Select category from first combobox
    const categorySelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(categorySelect, 'Electronics')
    
    const priceInputs = screen.getAllByPlaceholderText(/0\.00/i)
    await user.type(priceInputs[0], '150') // Listing price
    await user.type(priceInputs[1], '100') // Purchase price
    
    // Select platform from second combobox
    const platformSelect = screen.getAllByRole('combobox')[1]
    await user.selectOptions(platformSelect, 'eBay')
    
    // Select condition from third combobox
    const conditionSelect = screen.getAllByRole('combobox')[2]
    await user.selectOptions(conditionSelect, 'good')
    
    // Select status from fourth combobox
    const statusSelect = screen.getAllByRole('combobox')[3]
    await user.selectOptions(statusSelect, 'listed')
    
    const submitButton = screen.getByRole('button', { name: /create product/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Product',
          category: 'Electronics',
          listing_price: 150,
          purchase_price: 100,
          platform: 'eBay',
          condition: 'good',
          status: 'listed'
        })
      )
    })
  })

  it('handles image upload', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    
    const fileInput = screen.getByText(/upload image/i).closest('div')?.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    
    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' })
    
    if (fileInput) {
      await user.upload(fileInput, file)
      expect(fileInput).toHaveValue('C:\\fakepath\\test.jpg')
    }
  })

  it('disables submit button during submission', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<ProductForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    
    await user.type(screen.getByPlaceholderText(/enter product name/i), 'New Product')
    
    const categorySelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(categorySelect, 'Electronics')
    
    const priceInputs = screen.getAllByPlaceholderText(/0\.00/i)
    await user.type(priceInputs[0], '150')
    
    const platformSelect = screen.getAllByRole('combobox')[1]
    await user.selectOptions(platformSelect, 'eBay')
    
    const submitButton = screen.getByRole('button', { name: /create product/i })
    
    // Click submit
    await user.click(submitButton)
    
    // Button should be disabled during submission
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('shows correct button text for editing', () => {
    render(<ProductForm product={mockProduct} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    
    expect(screen.getByRole('button', { name: /update product/i })).toBeInTheDocument()
  })

  it('handles character limits correctly', async () => {
    const user = userEvent.setup()
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    
    const nameInput = screen.getByPlaceholderText(/enter product name/i)
    const longName = 'a'.repeat(101)
    
    await user.type(nameInput, longName)
    
    const submitButton = screen.getByRole('button', { name: /create product/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name too long/i)).toBeInTheDocument()
    })
  })

  it('handles tag input formatting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    
    const tagsInput = screen.getByPlaceholderText(/enter tags separated by commas/i)
    
    await user.type(tagsInput, 'tag1, tag2, tag3')
    
    // Fill in required fields for form submission
    await user.type(screen.getByPlaceholderText(/enter product name/i), 'Test Product')
    
    const priceInputs = screen.getAllByPlaceholderText(/0\.00/i)
    await user.type(priceInputs[0], '100')
    
    const categorySelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(categorySelect, 'Electronics')
    
    const platformSelect = screen.getAllByRole('combobox')[1]
    await user.selectOptions(platformSelect, 'eBay')
    
    const conditionSelect = screen.getAllByRole('combobox')[2]
    await user.selectOptions(conditionSelect, 'good')
    
    const statusSelect = screen.getAllByRole('combobox')[3]
    await user.selectOptions(statusSelect, 'listed')
    
    const submitButton = screen.getByRole('button', { name: /create product/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: 'tag1, tag2, tag3'
        })
      )
    })
  })

  it('handles cancel button', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ProductForm onSubmit={vi.fn()} onCancel={onCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(onCancel).toHaveBeenCalled()
  })
})