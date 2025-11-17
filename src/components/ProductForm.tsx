import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check, Image as ImageIcon, NotebookPen, Sparkles, Tag, Upload } from 'lucide-react';

const priceField = z.preprocess((value) => {
  if (value === '' || value === null || typeof value === 'undefined') return undefined;
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}, z.number().positive('Price must be positive').optional());

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(120, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.string().max(60, 'Category too long').optional(),
  listing_price: priceField,
  purchase_price: priceField,
  platform: z.string().max(60, 'Platform too long').optional(),
  status: z.enum(['listed', 'sold', 'pending', 'expired']).default('listed'),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).default('good'),
  tags: z.string().optional(),
  notes: z.string().max(1000, 'Notes too long').optional()
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

const conditionOptions = [
  { value: 'new', label: 'Brand new' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Well loved' }
];

const statusOptions = [
  { value: 'listed', label: 'Ready to sell' },
  { value: 'pending', label: 'In talks' },
  { value: 'sold', label: 'Sold' },
  { value: 'expired', label: 'Archived' }
];

const quickCategories = ['Tech', 'Fashion', 'Home', 'Collectibles'];

const steps = [
  {
    id: 1,
    title: 'Name it',
    description: 'Start with the product title',
    icon: Sparkles
  },
  {
    id: 2,
    title: 'Show it',
    description: 'Add visuals & context',
    icon: ImageIcon
  },
  {
    id: 3,
    title: 'Price it',
    description: 'Optional pricing & notes',
    icon: NotebookPen
  }
];

const stepFieldMap: Record<number, (keyof ProductFormData)[]> = {
  1: ['name'],
  2: [],
  3: []
};

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || '',
      listing_price: product?.listing_price ? Number(product.listing_price) : undefined,
      purchase_price: product?.purchase_price ? Number(product.purchase_price) : undefined,
      platform: product?.platform || '',
      status: (product?.status as ProductFormData['status']) || 'listed',
      condition: (product?.condition as ProductFormData['condition']) || 'good',
      tags: product?.tags?.join ? product.tags.join(', ') : product?.tags || '',
      notes: product?.notes || ''
    }
  });

  const watchedListingPrice = watch('listing_price');
  const watchedPurchasePrice = watch('purchase_price');
  const watchedStatus = watch('status');

  const projectedProfit = useMemo(() => {
    if (watchedListingPrice && watchedPurchasePrice) {
      return watchedListingPrice - watchedPurchasePrice;
    }
    return null;
  }, [watchedListingPrice, watchedPurchasePrice]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const goToStep = async (direction: 'next' | 'back') => {
    if (direction === 'next') {
      const fields = stepFieldMap[activeStep];
      if (fields?.length) {
        const isValid = await trigger(fields);
        if (!isValid) return;
      }
      setActiveStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      setActiveStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleSkip = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length));
  };

  const onFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        tags: data.tags?.trim() ? data.tags : undefined
      });
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (activeStep / steps.length) * 100;
  const isLastStep = activeStep === steps.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 text-slate-50 py-10 px-4">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-white/10">
        <div className="border-b border-white/10 p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Guided flow</p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                {product?.id ? 'Update product' : 'Add a new product'}
              </h1>
              <p className="mt-2 text-sm text-indigo-100">
                Answer one bite-sized question per step. You can always come back later to enrich the details.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Close
            </button>
          </div>

          <div>
            <div className="h-1.5 w-full rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;
                const isComplete = activeStep > step.id;
                return (
                  <div
                    key={step.id}
                    className={`rounded-2xl border px-4 py-3 text-sm transition ${
                      isActive
                        ? 'border-white/60 bg-white/10 text-white shadow-glow'
                        : isComplete
                        ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100'
                        : 'border-white/5 bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isComplete ? 'bg-emerald-400/20' : 'bg-white/10'}`}>
                        {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold">{step.title}</p>
                        <p className="text-xs text-slate-300">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 p-6 sm:p-10">
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner">
                <label htmlFor="name" className="text-sm font-semibold text-white">
                  Give your product a name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. iPhone 15 Pro Max"
                  {...register('name')}
                  className="mt-3 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
                />
                {errors.name && <p className="mt-2 text-sm text-rose-300">{errors.name.message}</p>}
                <p className="mt-3 text-sm text-slate-200">Only the title is required to get started.</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold text-white">Need inspiration?</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {quickCategories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => {
                        const input = document.getElementById('name') as HTMLInputElement | null;
                        if (input && !input.value.toLowerCase().includes(category.toLowerCase())) {
                          input.value = `${input.value ? `${input.value} ` : ''}${category}`;
                          input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }}
                      className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-slate-100 transition hover:-translate-y-0.5 hover:border-white/40"
                    >
                      <Tag className="mr-2 h-4 w-4" /> {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-6 text-center">
                  <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-white/10">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-36 w-36 rounded-3xl object-cover" />
                      ) : product?.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-36 w-36 rounded-3xl object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-white/60" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">Drop in a quick photo (optional)</p>
                      <p className="text-sm text-slate-200">Photos can be added later, but they help you identify the item quickly.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
                      >
                        <Upload className="mr-2 inline h-4 w-4" /> Upload
                      </label>
                      <button
                        type="button"
                        className="rounded-2xl border border-white/0 bg-white/10 px-4 py-2 text-sm text-slate-100"
                        onClick={() => setImagePreview(null)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-white">Category (optional)</label>
                    <input
                      type="text"
                      placeholder="Electronics, Fashion, Collectibles..."
                      {...register('category')}
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white">Condition</label>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {conditionOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:border-white/40"
                        >
                          <input
                            type="radio"
                            value={option.value}
                            {...register('condition')}
                            className="h-4 w-4 border-white/30 bg-transparent text-sky-400 focus:ring-sky-300"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white">Tags (optional)</label>
                    <input
                      type="text"
                      placeholder="Separate with commas"
                      {...register('tags')}
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-white">Platform (optional)</label>
                    <input
                      type="text"
                      placeholder="eBay, Marketplace, Shopify..."
                      {...register('platform')}
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white">Status</label>
                    <select
                      {...register('status')}
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white focus:border-sky-300 focus:outline-none"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white">Listing price (optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('listing_price')}
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
                    />
                    {errors.listing_price && <p className="mt-2 text-sm text-rose-300">{errors.listing_price.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white">Cost (optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('purchase_price')}
                      className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
                    />
                    {errors.purchase_price && <p className="mt-2 text-sm text-rose-300">{errors.purchase_price.message}</p>}
                  </div>
                </div>

                {projectedProfit !== null && (
                  <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                    Potential profit: <span className="font-semibold">${projectedProfit.toFixed(2)}</span>{' '}
                    {watchedStatus === 'sold' ? '(based on sale details)' : '(if sold at this price)'}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <label className="text-sm font-semibold text-white">Notes (optional)</label>
                <textarea
                  rows={4}
                  placeholder="Add quick reminders, buyer context, or custom steps"
                  {...register('notes')}
                  className="mt-2 w-full rounded-3xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-300">
              {isLastStep ? 'Ready to save. You can always edit later.' : `Next up: ${steps[activeStep]?.title ?? ''}`}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={() => goToStep('back')}
                  className="flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </button>
              )}

              {!isLastStep && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-2xl border border-white/0 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10"
                >
                  Skip step
                </button>
              )}

              {isLastStep ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-0.5 disabled:opacity-70"
                >
                  {isSubmitting ? 'Saving...' : product?.id ? 'Save changes' : 'Save product'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToStep('next')}
                  className="flex items-center justify-center rounded-2xl bg-white/15 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 backdrop-blur hover:bg-white/20"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
