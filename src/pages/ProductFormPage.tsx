import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import ProductForm from '../components/ProductForm';
import { dbHelpers } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../routes';

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await dbHelpers.getProduct(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const productData = {
        ...formData,
        user_id: user.id,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
        profit: formData.status === 'sold' && formData.listing_price && formData.purchase_price 
          ? formData.listing_price - formData.purchase_price 
          : null,
        sold_price: formData.status === 'sold' ? formData.listing_price : null
      };

      const { error } = await dbHelpers.createProduct(productData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Product created successfully!');
      navigate(ROUTES.dashboardProducts);
    },
    onError: (error) => {
      toast.error('Failed to create product');
      console.error('Create product error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!id) throw new Error('Product ID required');
      
      const productData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
        profit: formData.status === 'sold' && formData.listing_price && formData.purchase_price 
          ? formData.listing_price - formData.purchase_price 
          : null,
        sold_price: formData.status === 'sold' ? formData.listing_price : null
      };

      const { error } = await dbHelpers.updateProduct(id, productData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Product updated successfully!');
      navigate(ROUTES.dashboardProducts);
    },
    onError: (error) => {
      toast.error('Failed to update product');
      console.error('Update product error:', error);
    }
  });

  const handleSubmit = async (formData: any) => {
    if (isEditing) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.dashboardProducts);
  };

  if (isEditing && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}