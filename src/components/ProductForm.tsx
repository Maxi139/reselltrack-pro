import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, DollarSign, Package, Tag, FileText, Camera, Sparkles } from 'lucide-react'

const priceField = z.preprocess((value) => {
  if (value === '' || value === null || typeof value === 'undefined') return undefined
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().positive('Price must be positive').optional())

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.string().min(1, 'Category is required'),
  listing_price: priceField,
  purchase_price: priceField,
  platform: z.string().min(1, 'Platform is required'),
  status: z.enum(['listed', 'sold', 'pending', 'expired']),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  tags: z.string().optional(),
  notes: z.string().max(1000, 'Notes too long').optional()
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: any
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
}

const categories = [
  'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys',
  'Collectibles', 'Automotive', 'Health & Beauty', 'Other'
]

const platforms = [
  'eBay', 'Facebook Marketplace', 'Craigslist', 'OfferUp', 'Mercari',
  'Poshmark', 'Depop', 'Etsy', 'Amazon', 'Local', 'Other'
]

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
]

const statuses = [
  { value: 'listed', label: 'Listed', color: 'blue' },
  { value: 'sold', label: 'Sold', color: 'green' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'expired', label: 'Expired', color: 'red' }
]

const steps = [
  { id: 1, title: 'Product Details', description: 'Basics, media & tags' },
  { id: 2, title: 'Pricing & Status', description: 'Financials & platform' }
]

const stepFieldMap: Record<number, (keyof ProductFormData)[]> = {
  1: ['name', 'category', 'condition', 'description', 'tags'],
  2: ['platform', 'status', 'listing_price', 'purchase_price', 'notes']
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null)
  const [activeStep, setActiveStep] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          ...product,
          listing_price: product.listing_price ? Number(product.listing_price) : undefined,
          purchase_price: product.purchase_price ? Number(product.purchase_price) : undefined,
          tags: product.tags?.join(', ')
        }
      : {
          status: 'listed',
          condition: 'good'
        }
  })

  const watchedStatus = watch('status')
  const watchedListingPrice = watch('listing_price')
  const watchedPurchasePrice = watch('purchase_price')

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateProfit = () => {
    if (watchedListingPrice && watchedPurchasePrice && watchedStatus === 'sold') {
      return watchedListingPrice - watchedPurchasePrice
    }
    return null
  }

  const profit = calculateProfit()

  const handleNext = async () => {
    const isValid = await trigger(stepFieldMap[activeStep])
    if (isValid) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8 backdrop-blur">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Product Flow</p>
            <h2 className="text-2xl font-bold text-slate-900">
              {product ? 'Update product' : 'Add new product'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Modern, guided steps keep everything tidy and fast.</p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <ol className="flex flex-col gap-4 sm:flex-row">
            {steps.map((step, index) => {
              const isActive = activeStep === step.id
              const isComplete = activeStep > step.id
              return (
                <li key={step.id} className="flex flex-1 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                        : isComplete
                        ? 'bg-success-100 text-success-700'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isComplete ? <Sparkles className="h-4 w-4" /> : index + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{step.title}</p>
                    <p className="text-xs text-slate-400">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="max-h-[70vh] overflow-y-auto px-6 py-6 sm:px-8">
          {activeStep === 1 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
                  <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-inner">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-2xl object-cover" />
                      ) : product?.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-24 w-24 rounded-2xl object-cover" />
                      ) : (
                        <Camera className="h-10 w-10 text-slate-300" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                    >
                      <Upload className="h-4 w-4" /> Upload gallery
                    </button>
                    <p className="text-xs text-slate-400">PNG oder JPG bis 10MB</p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Product name *</label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="e.g. Air Jordan 1 Retro"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Category *</label>
                    <select
                      {...register('category')}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Condition *</label>
                    <select
                      {...register('condition')}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    >
                      {conditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                    {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Description</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Share size, accessories or story that makes it sell faster"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Tags</label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <Tag className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      {...register('tags')}
                      className="w-full border-none text-sm text-slate-900 focus:outline-none"
                      placeholder="e.g. limited, boxed, vintage"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Separate tags with commas</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Smart product profile</p>
                      <p className="text-xs text-slate-500">Keep dimensions, accessories and authenticity notes here.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">Notes for your team</label>
                  <textarea
                    {...register('notes')}
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    placeholder="Pickup reminder, buyer preferences, shipping information..."
                  />
                  {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-slate-900">
                    <DollarSign className="mr-2 h-5 w-5 text-primary-500" /> Pricing (optional)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Expected sale price</label>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3">
                        <span className="text-sm text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          {...register('listing_price', { valueAsNumber: true })}
                          className="w-full border-none text-sm text-slate-900 focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      {errors.listing_price && <p className="mt-1 text-sm text-red-600">{errors.listing_price.message}</p>}
                      <p className="mt-1 text-xs text-slate-400">We’ll keep this flexible until you close the deal.</p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Purchase price</label>
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3">
                        <span className="text-sm text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          {...register('purchase_price', { valueAsNumber: true })}
                          className="w-full border-none text-sm text-slate-900 focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      {errors.purchase_price && <p className="mt-1 text-sm text-red-600">{errors.purchase_price.message}</p>}
                    </div>

                    {profit !== null && (
                      <div className="rounded-2xl border border-success-100 bg-success-50/80 p-4">
                        <p className="text-sm font-semibold text-success-700">Projected profit</p>
                        <p className="text-2xl font-bold text-success-600">${profit.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <label className="mb-2 block text-sm font-medium text-slate-600">Platform *</label>
                  <select
                    {...register('platform')}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">Select platform</option>
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                  {errors.platform && <p className="mt-1 text-sm text-red-600">{errors.platform.message}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <label className="mb-2 block text-sm font-medium text-slate-600">Status *</label>
                  <select
                    {...register('status')}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
                </div>

                <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary-500" />
                    <div>
                      <p className="text-sm font-semibold text-primary-700">Need to mark it sold?</p>
                      <p className="text-xs text-primary-600">Use the new "Mark as sold" action directly from the product list.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              Cancel
            </button>
            <div className="flex flex-col gap-3 sm:flex-row">
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="rounded-2xl px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                >
                  Back
                </button>
              )}
              {activeStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-primary-600 hover:to-primary-700 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent"></span>
                      Saving...
                    </div>
                  ) : (
                    'Save product'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
