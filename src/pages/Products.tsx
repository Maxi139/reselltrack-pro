import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, DollarSign, Package, Tag, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
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
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<ProductFilters>({
    status: 'all',
    category: 'all',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [markSoldProduct, setMarkSoldProduct] = useState<DashboardProduct | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: () => dbHelpers.getProducts(user!.id),
    enabled: !!user?.id
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => dbHelpers.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const markSoldMutation = useMutation({
    mutationFn: (payload: MarkSoldPayload) => dbHelpers.markProductAsSold(payload.product.id, payload.soldPrice, payload.soldDate, payload.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setMarkSoldProduct(null);
    }
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = products.filter(product => {
      if (filters.status !== 'all' && product.status !== filters.status) return false;
      if (filters.category !== 'all' && product.category !== filters.category) return false;
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof DashboardProduct];
      const bValue = b[filters.sortBy as keyof DashboardProduct];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [products, filters]);

  const handleDemoAction = (action: string) => {
    notifyDemoRestriction(action);
  };

  const handleDelete = (productId: string) => {
    if (isDemoMode) {
      handleDemoAction('Deleting products');
      return;
    }

    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
    }
  };

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

    const listedProducts = products.filter(p => p.status === 'listed');
    const soldProducts = products.filter(p => p.status === 'sold');
    const totalInventoryValue = listedProducts.reduce((sum, p) => sum + (p.listing_price || 0), 0);
    const totalProfit = soldProducts.reduce((sum, p) => sum + (p.profit || 0), 0);
    const conversionRate = products.length > 0 ? (soldProducts.length / products.length) * 100 : 0;

    return {
      totalInventoryValue,
      soldCount: soldProducts.length,
      totalProfit,
      conversionRate,
      activeListings: listedProducts.length
    };
  }, [products]);

  const highlightCards = [
    {
      title: 'Inventory value',
      value: formatCurrency(metrics.totalInventoryValue),
      helper: 'Listed items',
      accent: 'from-blue-500/10 to-blue-500/5'
    },
    {
      title: 'Items sold',
      value: metrics.soldCount.toString(),
      helper: 'Total sales',
      accent: 'from-emerald-500/10 to-emerald-500/5'
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 xl:px-12 xl:py-16">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-500 xl:text-base">Inventory</p>
            <h1 className="text-4xl font-bold text-slate-900 xl:text-5xl">Products</h1>
            <p className="mt-3 text-base text-slate-500 xl:text-lg xl:leading-relaxed">
              {isDemoMode
                ? 'You are currently browsing curated demo products.'
                : 'Keep every listing, offer and sale in one elegant, filterable surface.'}
            </p>
          </div>
          <div className="flex gap-3">
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {highlightCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-3xl border border-white/60 bg-gradient-to-br ${card.accent} p-6 shadow-lg shadow-black/5 backdrop-blur xl:p-8`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 xl:text-base">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900 xl:text-3xl">{card.value}</p>
                  <p className="text-xs text-slate-500 xl:text-sm">{card.helper}</p>
                </div>
                <div className="rounded-full bg-white/50 p-3 xl:p-4">
                  <DollarSign className="h-6 w-6 text-slate-700 xl:h-8 xl:w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2 xl:gap-3">
              {quickStatusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilters(prev => ({ ...prev, status: filter.value }))}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors xl:px-5 xl:py-2.5 xl:text-base ${
                    filters.status === filter.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 xl:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 xl:h-5 xl:w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent xl:pl-12 xl:pr-5 xl:py-2.5 xl:text-base"
                />
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent xl:px-4 xl:py-2.5 xl:text-base"
              >
                <option value="created_at">Date Created</option>
                <option value="name">Name</option>
                <option value="listing_price">Price</option>
                <option value="status">Status</option>
              </select>
            </div>
            <button
              type="button"
              onClick={startProductFlow}
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Flow öffnen
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </section>

        <div className="mt-6">
          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow xl:hover:shadow-lg">
                  <div className="p-6 xl:p-8">
                    <div className="flex items-start justify-between mb-4 xl:mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1 xl:text-xl">{product.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 xl:text-base">
                          <Tag className="h-4 w-4 xl:h-5 xl:w-5" />
                          <span>{product.category || 'No category'}</span>
                          <span>•</span>
                          <Calendar className="h-4 w-4 xl:h-5 xl:w-5" />
                          <span>{formatDate(product.created_at)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium xl:px-4 xl:py-1.5 xl:text-sm ${
                        product.status === 'listed' ? 'bg-blue-100 text-blue-800' :
                        product.status === 'sold' ? 'bg-green-100 text-green-800' :
                        product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2 xl:text-base xl:mb-6">{product.description}</p>
                    )}

                    <div className="flex items-center justify-between mb-4 xl:mb-6">
                      <div>
                        <p className="text-xs text-slate-500 xl:text-sm">Listing Price</p>
                        <p className="text-lg font-semibold text-slate-900 xl:text-xl">
                          {product.listing_price ? formatCurrency(product.listing_price) : 'Not set'}
                        </p>
                      </div>
                      {product.status === 'sold' && product.profit && (
                        <div className="text-right">
                          <p className="text-xs text-slate-500 xl:text-sm">Profit</p>
                          <p className="text-lg font-semibold text-green-600 xl:text-xl">
                            {formatCurrency(product.profit)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 xl:gap-3">
                      <Link
                        to={ROUTES.dashboardProductDetail(product.id)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors xl:px-5 xl:py-2.5 xl:text-base"
                      >
                        <Eye className="h-4 w-4 mr-2 xl:h-5 xl:w-5 xl:mr-3" />
                        View
                      </Link>
                      {isDemoMode ? (
                        <div className="flex gap-2">
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
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Link
                            to={ROUTES.dashboardProductEdit(product.id)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {product.status === 'listed' && (
                            <button
                              type="button"
                              onClick={() => openMarkSoldFlow(product)}
                              className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Mark sold
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-white/20 bg-white/5 p-10 text-center text-white/80">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-white">
                <DollarSign className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-3xl font-semibold text-white">
                {isDemoMode ? 'Demo-Inventar wird geladen' : 'Starte deine erste Produktreihe'}
              </h3>
              <p className="text-gray-500 mb-6">
                {isDemoMode
                  ? 'Demo products will appear here automatically.'
                  : filters.search || filters.status !== 'all' || filters.category !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first product.'}
              </p>
              {!isDemoMode && (
                <Link
                  to={ROUTES.dashboardProductNew}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mark as Sold Modal */}
      {markSoldProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Product as Sold</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Product: {markSoldProduct.name}</p>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sold Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter sold price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onChange={(e) => {
                  const soldPrice = parseFloat(e.target.value);
                  if (soldPrice > 0) {
                    handleMarkSoldSubmit({ soldPrice, soldDate: new Date().toISOString() });
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeMarkSoldFlow}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleMarkSoldSubmit({ soldPrice: markSoldProduct.listing_price || 0, soldDate: new Date().toISOString() })}
                disabled={markSoldMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                {markSoldMutation.isPending ? 'Processing...' : 'Mark as Sold'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
