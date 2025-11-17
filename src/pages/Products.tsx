import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CopyPlus, DollarSign, Edit, Package, Plus, Search, Sparkles, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { dbHelpers } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters';
import { ROUTES } from '../routes';
import { notifyDemoRestriction } from '../utils/demoMode';
import MarkAsSoldDialog from '../components/MarkAsSoldDialog';

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
    listed: 'bg-sky-100/80 text-sky-900',
    sold: 'bg-emerald-100/80 text-emerald-900',
    pending: 'bg-amber-100/80 text-amber-900',
    expired: 'bg-rose-100/80 text-rose-900'
  };

  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];

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

  const flowSteps = [
    {
      title: 'Titel wählen',
      description: 'Starte mit einem klaren Namen – mehr brauchst du zunächst nicht.',
      icon: Sparkles,
      accent: 'from-sky-500/30 to-violet-500/30'
    },
    {
      title: 'Fotos & Story',
      description: 'Füge auf der zweiten Seite Bilder oder Tags hinzu, wenn du soweit bist.',
      icon: Tag,
      accent: 'from-indigo-500/30 to-cyan-500/30'
    },
    {
      title: 'Preis optional',
      description: 'Entscheide selbst, ob du jetzt schon Preise hinterlegen möchtest.',
      icon: DollarSign,
      accent: 'from-emerald-500/30 to-lime-500/30'
    }
  ];

  const relistMoments = [
    {
      label: '01',
      title: 'Wähle eine Vorlage',
      description: 'Jedes Produkt lässt sich mit einem Klick erneut anlegen.'
    },
    {
      label: '02',
      title: 'Passe Details an',
      description: 'Nur was du änderst, wird gespeichert – der Rest bleibt optional.'
    },
    {
      label: '03',
      title: 'Markiere Verkäufe',
      description: 'Die neue Sold-Ansicht sammelt Preis, Datum und Notizen in einem Schritt.'
    }
  ];

  const startProductFlow = () => {
    if (isDemoMode) {
      handleDemoAction('Creating new products');
      return;
    }
    navigate(ROUTES.dashboardProductNew);
  };

  const reuseProductDetails = (productId: string) => {
    if (isDemoMode) {
      handleDemoAction('Reusing product templates');
      return;
    }
    navigate(`${ROUTES.dashboardProductNew}?template=${productId}`);
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.55)] backdrop-blur-2xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300">Produkt Flow</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
                Übersichtliche Inventarverwaltung, Schritt für Schritt
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-200">
                Beginne immer nur mit dem Namen. Danach führen wir dich Seite für Seite durch Bilder, Story und optionale Preise.
                Alles bleibt übersichtlich – egal ob am Handy oder Desktop.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  id="add-product-btn"
                  onClick={startProductFlow}
                  className="inline-flex items-center rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
                >
                  <Plus className="mr-2 h-4 w-4" /> Flow starten
                </button>
                <Link
                  to={ROUTES.demo}
                  className="inline-flex items-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/40"
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Demo ansehen
                </Link>
              </div>
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              {flowSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className={`rounded-3xl border border-white/10 bg-gradient-to-br ${step.accent} p-4 text-white/90 shadow-inner`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                    <p className="mt-4 text-lg font-semibold">{step.title}</p>
                    <p className="text-sm text-white/80">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {highlightCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-6 text-white/90 shadow-inner`}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{card.title}</p>
              <p className="mt-3 text-3xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-white/80">{card.helper}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300">Inventarfilter</p>
                <h2 className="text-2xl font-semibold text-white">Finde in Sekunden, was du suchst</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Produkt suchen"
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none sm:w-64"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                    className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky-300 focus:outline-none"
                  >
                    <option className="bg-slate-900" value="created_at">Neueste zuerst</option>
                    <option className="bg-slate-900" value="name">Name</option>
                    <option className="bg-slate-900" value="listing_price">Preis</option>
                    <option className="bg-slate-900" value="status">Status</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                      }))
                    }
                    className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                  >
                    {filters.sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300">Status</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {quickStatusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, status: filter.value }))}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        filters.status === filter.value
                          ? 'bg-white text-slate-900'
                          : 'bg-white/10 text-slate-200 hover:bg-white/20'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300">Kategorie</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          category: prev.category === category ? 'all' : category
                        }))
                      }
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        filters.category === category
                          ? 'border-white bg-white/90 text-slate-900'
                          : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/5 to-white/10 p-6 text-white/90">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300">Re-Listing Flow</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Produkte erneut verwenden</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <CopyPlus className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-6 space-y-5">
              {relistMoments.map((moment) => (
                <div key={moment.label} className="flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                    {moment.label}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{moment.title}</p>
                    <p className="text-xs text-slate-200">{moment.description}</p>
                  </div>
                </div>
              ))}
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

        <section className="mt-10">
          {products && products.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {products.map((product) => (
                <div key={product.id} className="rounded-[28px] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-2xl">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{formatDate(product.created_at)}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">{product.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {product.category && <span>{product.category}</span>}
                        {product.platform && (
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" /> {product.platform}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[product.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  {product.description && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-3">{product.description}</p>
                  )}

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Angebotspreis</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {product.listing_price ? formatCurrency(product.listing_price) : '—'}
                      </p>
                      {product.purchase_price && (
                        <p className="text-xs text-slate-500">Einkauf: {formatCurrency(product.purchase_price)}</p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Status & Profit</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-600">
                        {product.profit ? formatCurrency(product.profit) : product.status === 'sold' ? 'verkauft' : 'offen'}
                      </p>
                      {product.sold_price && (
                        <p className="text-xs text-slate-500">Verkauft für {formatCurrency(product.sold_price)}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => reuseProductDetails(product.id)}
                      className="inline-flex items-center rounded-2xl border border-dashed border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-500"
                    >
                      <CopyPlus className="mr-2 h-3 w-3" /> Details erneut nutzen
                    </button>
                    {product.status !== 'sold' && (
                      <button
                        type="button"
                        onClick={() => openMarkSoldFlow(product)}
                        className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800"
                      >
                        <CheckCircle2 className="mr-2 h-3 w-3" /> Als verkauft markieren
                      </button>
                    )}
                    {isDemoMode ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDemoAction('Editing products')}
                          className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-400"
                          aria-disabled
                        >
                          <Edit className="mr-2 h-3 w-3" /> Bearbeiten
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDemoAction('Deleting products')}
                          className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-400"
                          aria-disabled
                        >
                          <Trash2 className="mr-2 h-3 w-3" /> Löschen
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={ROUTES.dashboardProductEdit(product.id)}
                          className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <Edit className="mr-2 h-3 w-3" /> Bearbeiten
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
                        >
                          <Trash2 className="mr-2 h-3 w-3" /> Löschen
                        </button>
                      </>
                    )}
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
              <p className="mt-2 text-sm text-white/70">
                {isDemoMode
                  ? 'Sobald du die Demo deaktivierst, kannst du eigene Produkte mit dem neuen Flow erstellen.'
                  : 'Lege einfach einen Namen fest und folge dem Flow – Preise kannst du jederzeit nachreichen.'}
              </p>
              <div className="mt-6">
                {isDemoMode ? (
                  <button
                    type="button"
                    onClick={() => handleDemoAction('Creating products')}
                    className="inline-flex items-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/70"
                    aria-disabled
                  >
                    <Plus className="mr-2 h-4 w-4" /> Flow gesperrt
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startProductFlow}
                    className="inline-flex items-center rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Jetzt starten
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {markSoldProduct && (
        <MarkAsSoldDialog
          product={markSoldProduct}
          onClose={closeMarkSoldFlow}
          onSubmit={handleMarkSoldSubmit}
          isSubmitting={markSoldMutation.isPending}
        />
      )}
    </div>
  );

}
