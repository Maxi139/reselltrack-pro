import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import MeetingForm from '../components/MeetingForm';
import { dbHelpers } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function MeetingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: meeting, isLoading: meetingLoading } = useQuery({
    queryKey: ['meeting', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await dbHelpers.getMeeting(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: products } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await dbHelpers.getProducts(user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const meetingData = {
        ...formData,
        user_id: user.id,
        scheduled_date: `${formData.scheduled_date}T${formData.scheduled_time}`,
        duration: formData.duration || 30
      };

      const { error } = await dbHelpers.createMeeting(meetingData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Meeting scheduled successfully!');
      navigate('/meetings');
    },
    onError: (error) => {
      toast.error('Failed to schedule meeting');
      console.error('Create meeting error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (!id) throw new Error('Meeting ID required');
      
      const meetingData = {
        ...formData,
        scheduled_date: `${formData.scheduled_date}T${formData.scheduled_time}`,
        duration: formData.duration || 30
      };

      const { error } = await dbHelpers.updateMeeting(id, meetingData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meeting', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Meeting updated successfully!');
      navigate('/meetings');
    },
    onError: (error) => {
      toast.error('Failed to update meeting');
      console.error('Update meeting error:', error);
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
    navigate('/meetings');
  };

  if (isEditing && meetingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MeetingForm
        meeting={meeting}
        products={products}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}