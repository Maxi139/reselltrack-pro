import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, DollarSign, Package, Tag, Calendar } from 'lucide-react';
import { dbHelpers } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';
import { ROUTES } from '../routes';
import { notifyDemoRestriction } from '../utils/demoMode';

interface ProductFilters {
  status: string;
  category: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

type DashboardProduct = {
  id: string;
  name: string;
  status: string;
  listing_price?: number | null;
  purchase_price?: number | null;
  sold_price?: number | null;
  profit?: number | null;
  description?: string | null;
  category?: string | null;
  platform?: string | null;
  image_url?: string | null;
  created_at: string;
  notes?: string | null;
};

type MarkSoldPayload = {
  product: DashboardProduct;
  soldPrice: number;
  soldDate: string;
  note?: string;
};

export default function Products() {
  const { user, isDemoMode } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<ProductFilters>({
    status: 'all',
    category: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const { data: products = [], isLoading } = useQuery<DashboardProduct[]>({
    queryKey: ['products', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await dbHelpers.getProducts(user.id);
      if (error) throw error;

      let filteredProducts: DashboardProduct[] = (data || []) as DashboardProduct[];
      
      // Apply filters
      if (filters.status !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.status === filters.status);
      }
      
      if (filters.category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.category?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting
      filteredProducts.sort((a, b) => {
        let aValue = a[filters.sortBy as keyof typeof a];
        let bValue = b[filters.sortBy as keyof typeof b];
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue as string).toLowerCase();
        }
        
        if (filters.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
      
      return filteredProducts;
    },
    enabled: !!user?.id
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await dbHelpers.deleteProduct(productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const [markSoldProduct, setMarkSoldProduct] = useState<DashboardProduct | null>(null);

  const markSoldMutation = useMutation({
    mutationFn: async ({ product, soldPrice, soldDate, note }: MarkSoldPayload) => {
      const profit = product.purchase_price ? soldPrice - Number(product.purchase_price) : null;
      const { error } = await dbHelpers.updateProduct(product.id, {
        status: 'sold',
        sold_price: soldPrice,
        sold_at: soldDate,
        profit,
        notes: note?.trim() ? note : product.notes
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.product.name} marked as sold`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setMarkSoldProduct(null);
    },
    onError: () => {
      toast.error('Failed to mark product as sold');
    }
  });

  const statusColors = {
    listed: 'bg-blue-50 text-blue-600',
    sold: 'bg-green-50 text-green-600',
    pending: 'bg-yellow-50 text-yellow-600',
    expired: 'bg-red-50 text-red-600'
  };

  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];

  const handleDemoAction = (action: string) => {
    notifyDemoRestriction(action);
  };

  const handleDemoAction = (action: string) => {
    notifyDemoRestriction(action);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
    }
  };

  const metrics = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        totalInventoryValue: 0,
        soldCount: 0,
        totalProfit: 0,
        conversionRate: 0,
        activeListings: 0
      };
    }

    const soldItems = products.filter(product => product.status === 'sold');
    const totalProfit = soldItems.reduce((sum, product) => sum + (product.profit || 0), 0);
    const totalInventoryValue = products.reduce((sum, product) => sum + (product.listing_price || 0), 0);
    const conversionRate = products.length > 0 ? (soldItems.length / products.length) * 100 : 0;
    const activeListings = products.filter(product => product.status === 'listed').length;

    return {
      totalInventoryValue,
      soldCount: soldItems.length,
      totalProfit,
      conversionRate,
      activeListings
    };
  }, [products]);

  const highlightCards = [
    {
      title: 'Inventory value',
      value: formatCurrency(metrics.totalInventoryValue),
      helper: 'Based on listed price',
      accent: 'from-primary-500/10 to-primary-500/5'
    },
    {
      title: 'Sold this month',
      value: metrics.soldCount.toString(),
      helper: 'Closed deals',
      accent: 'from-success-500/10 to-success-500/5'
    },
    {
      title: 'Total profit',
      value: formatCurrency(metrics.totalProfit),
      helper: 'Calculated on sale',
      accent: 'from-amber-500/10 to-amber-500/5'
    },
    {
      title: 'Conversion rate',
      value: formatPercentage(metrics.conversionRate || 0),
      helper: `${metrics.activeListings} active listings`,
      accent: 'from-purple-500/10 to-purple-500/5'
    }
  ];

  const quickStatusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Listed', value: 'listed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Sold', value: 'sold' }
  ];

  const openMarkSoldFlow = (product: DashboardProduct) => {
    if (isDemoMode) {
      handleDemoAction('Marking products as sold');
      return;
    }
    setMarkSoldProduct(product);
  };

  const handleMarkSoldSubmit = (payload: { soldPrice: number; soldDate: string; note?: string }) => {
    if (!markSoldProduct) return;
    markSoldMutation.mutate({ product: markSoldProduct, ...payload });
  };

  const closeMarkSoldFlow = () => {
    if (markSoldMutation.isPending) return;
    setMarkSoldProduct(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary-500">Inventory</p>
            <h1 className="text-4xl font-bold text-slate-900">Products</h1>
            <p className="mt-2 text-base text-slate-500">
              {isDemoMode
                ? 'You are currently browsing curated demo products.'
                : 'Keep every listing, offer and sale in one elegant, filterable surface.'}
            </p>
          </div>
          {isDemoMode ? (
            <button
              type="button"
              id="add-product-btn"
              onClick={() => handleDemoAction('Creating products')}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg cursor-not-allowed"
              aria-disabled
              title="Demo mode"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          ) : (
            <Link
              id="add-product-btn"
              to={ROUTES.dashboardProductNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary-500" />
              Plan pickup
            </Link>
            {isDemoMode ? (
              <button
                type="button"
                id="add-product-btn"
                onClick={() => handleDemoAction('Creating products')}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-500"
                aria-disabled
                title="Demo mode"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add product
              </button>
            ) : (
              <Link
                id="add-product-btn"
                to={ROUTES.dashboardProductNew}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:from-primary-600 hover:to-primary-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add product
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {highlightCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-3xl border border-white/60 bg-gradient-to-br ${card.accent} p-6 shadow-lg shadow-black/5 backdrop-blur`}
            >
              <p className="text-sm font-semibold text-slate-500">{card.title}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{card.helper}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-6">
          <div className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-xl shadow-black/5 ring-1 ring-black/5">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Search inventory</label>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Name, description or category"
                    value={filters.search}
                    onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-11 py-3 text-sm text-slate-900 shadow-inner focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
                  <select
                    value={filters.category}
                    onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="all">All categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort by</label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(event) => {
                      const [sortBy, sortOrder] = event.target.value.split('-');
                      setFilters((prev) => ({
                        ...prev,
                        sortBy,
                        sortOrder: sortOrder as 'asc' | 'desc'
                      }));
                    }}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="created_at-desc">Newest first</option>
                    <option value="created_at-asc">Oldest first</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="listing_price-desc">Price high-low</option>
                    <option value="listing_price-asc">Price low-high</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick filters</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickStatusFilters.map((chip) => (
                      <button
                        key={chip.value}
                        type="button"
                        onClick={() => setFilters((prev) => ({ ...prev, status: chip.value }))}
                        className={`rounded-2xl px-4 py-2 text-xs font-semibold ${
                          filters.status === chip.value
                            ? 'bg-slate-900 text-white shadow'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/90 shadow-2xl shadow-black/5 ring-1 ring-black/5">
            {products && products.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {products.map((product) => (
                  <div key={product.id} className="flex flex-col gap-6 px-6 py-6 sm:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                      <div className="flex flex-1 items-start gap-4">
                        <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-slate-100 text-slate-400">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[product.status as keyof typeof statusColors]}`}>
                              {product.status}
                            </span>
                            {product.platform && (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                {product.platform}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {product.category}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(product.created_at)}
                            </span>
                          </div>
                          {product.description && (
                            <p className="mt-3 text-sm text-slate-600 line-clamp-2">{product.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          to={ROUTES.dashboardProductDetail(product.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {isDemoMode ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDemoAction('Editing products')}
                              className="p-2 text-gray-300 cursor-not-allowed"
                              aria-disabled
                              title="Demo mode"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDemoAction('Deleting products')}
                              className="p-2 text-gray-300 cursor-not-allowed"
                              aria-disabled
                              title="Demo mode"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to={ROUTES.dashboardProductEdit(product.id)}
                              className="p-2 text-gray-400 hover:text-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => (isDemoMode ? handleDemoAction('Marking products as sold') : openMarkSoldFlow(product))}
                              className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800"
                            >
                              <CheckCircle2 className="mr-2 h-3 w-3" /> Mark sold
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDemoMode ? 'No demo products available' : 'No products found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {isDemoMode
                  ? 'Demo products will appear here automatically.'
                  : filters.search || filters.status !== 'all' || filters.category !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first product.'}
              </p>
              {isDemoMode ? (
                <button
                  type="button"
                  onClick={() => handleDemoAction('Creating products')}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg cursor-not-allowed"
                  aria-disabled
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              ) : (
                <Link
                  to={ROUTES.dashboardProductNew}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {products && products.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {products.length}
                </div>
                <div className="text-sm text-gray-500">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.status === 'sold').length}
                </div>
                <div className="text-sm text-gray-500">Sold</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                  {isDemoMode ? 'Demo inventory is loading' : 'Build your first collection'}
                </h3>
                <p className="mt-2 max-w-lg text-sm text-slate-500">
                  {isDemoMode
                    ? 'Sample products will appear here shortly. Toggle demo off to start adding your own listings.'
                    : 'Start by adding your first product. No sale price required — you can finalize pricing later.'}
                </p>
                <div className="mt-6">
                  {isDemoMode ? (
                    <button
                      type="button"
                      onClick={() => handleDemoAction('Creating products')}
                      className="inline-flex items-center rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-500"
                      aria-disabled
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add product
                    </button>
                  ) : (
                    <Link
                      to={ROUTES.dashboardProductNew}
                      className="inline-flex items-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add product
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {markSoldProduct && (
        <MarkAsSoldDialog
          key={markSoldProduct.id}
          product={markSoldProduct}
          onClose={closeMarkSoldFlow}
          onConfirm={handleMarkSoldSubmit}
          isSubmitting={markSoldMutation.isPending}
        />
      )}
    </div>
  );
}