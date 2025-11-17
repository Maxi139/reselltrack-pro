import React, { useState } from 'react';
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

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await dbHelpers.getProducts(user.id);
      if (error) throw error;
      
      let filteredProducts = data || [];
      
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

  const statusColors = {
    listed: 'bg-blue-100 text-blue-800',
    sold: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800'
  };

  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Other'];
  const statuses = ['listed', 'sold', 'pending', 'expired'];

  const handleDemoAction = (action: string) => {
    notifyDemoRestriction(action);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-gray-600">
              {isDemoMode ? 'Viewing demo products' : 'Manage your product inventory and track sales'}
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
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* Sort */}
            <div>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({ 
                    ...prev, 
                    sortBy, 
                    sortOrder: sortOrder as 'asc' | 'desc' 
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="listing_price-desc">Price High-Low</option>
                <option value="listing_price-asc">Price Low-High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm">
          {products && products.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status as keyof typeof statusColors]}`}>
                            {product.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {product.category}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(product.created_at)}
                          </span>
                        </div>
                        
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Price and Actions */}
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(product.listing_price || 0)}
                        </div>
                        {product.sold_price && (
                          <div className="text-sm text-green-600">
                            Sold for {formatCurrency(product.sold_price)}
                          </div>
                        )}
                        {product.profit && (
                          <div className="text-sm text-green-600">
                            Profit: {formatCurrency(product.profit)}
                          </div>
                        )}
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
                              onClick={() => handleDelete(product.id)}
                              disabled={deleteMutation.isPending}
                              className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
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
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(products.reduce((sum, p) => sum + (p.listing_price || 0), 0))}
                </div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(products.length > 0 ? (products.filter(p => p.status === 'sold').length / products.length) * 100 : 0)}
                </div>
                <div className="text-sm text-gray-500">Conversion Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}