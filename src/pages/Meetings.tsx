import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Clock, User, MapPin, Phone, Mail, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { dbHelpers } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/formatters';
import { ROUTES } from '../routes';
import { notifyDemoRestriction } from '../utils/demoMode';

interface MeetingFilters {
  status: string;
  search: string;
  dateRange: string;
}

export default function Meetings() {
  const { user, isDemoMode } = useAuthStore();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<MeetingFilters>({
    status: 'all',
    search: '',
    dateRange: 'all'
  });

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['meetings', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await dbHelpers.getMeetings(user.id);
      if (error) throw error;
      
      let filteredMeetings = data || [];
      
      // Apply filters
      if (filters.status !== 'all') {
        filteredMeetings = filteredMeetings.filter(m => m.status === filters.status);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMeetings = filteredMeetings.filter(m => 
          m.title.toLowerCase().includes(searchLower) ||
          m.client_name.toLowerCase().includes(searchLower) ||
          m.client_email?.toLowerCase().includes(searchLower) ||
          m.location?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            filteredMeetings = filteredMeetings.filter(m => {
              const meetingDate = new Date(m.scheduled_date);
              return meetingDate.toDateString() === now.toDateString();
            });
            break;
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            filteredMeetings = filteredMeetings.filter(m => 
              new Date(m.scheduled_date) >= filterDate
            );
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            filteredMeetings = filteredMeetings.filter(m => 
              new Date(m.scheduled_date) >= filterDate
            );
            break;
        }
      }
      
      // Sort by scheduled date (closest first)
      filteredMeetings.sort((a, b) => 
        new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
      );
      
      return filteredMeetings;
    },
    enabled: !!user?.id
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ meetingId, status }: { meetingId: string; status: string }) => {
      const { error } = await dbHelpers.updateMeeting(meetingId, { status });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const { error } = await dbHelpers.deleteMeeting(meetingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    }
  });

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (meetingId: string, status: string) => {
    if (isDemoMode) {
      notifyDemoRestriction('Updating meetings');
      return;
    }

    updateStatusMutation.mutate({ meetingId, status });
  };

  const handleDelete = (meetingId: string) => {
    if (isDemoMode) {
      notifyDemoRestriction('Deleting meetings');
      return;
    }

    if (window.confirm('Are you sure you want to delete this meeting?')) {
      deleteMutation.mutate(meetingId);
    }
  };

  const isMeetingPast = (scheduledDate: string) => {
    return new Date(scheduledDate) < new Date();
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
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
            <p className="mt-2 text-gray-600">
              {isDemoMode ? 'Viewing demo meetings' : 'Schedule and manage client meetings'}
            </p>
          </div>
          {isDemoMode ? (
            <button
              type="button"
              onClick={() => notifyDemoRestriction('Scheduling meetings')}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg cursor-not-allowed"
              aria-disabled
              title="Demo mode"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </button>
          ) : (
            <Link
              to={ROUTES.dashboardMeetingNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search meetings..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
            
            {/* Date Range Filter */}
            <div>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {meetings && meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Meeting Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[meeting.status as keyof typeof statusColors]}`}>
                        {getStatusIcon(meeting.status)}
                      </div>
                    </div>
                    
                    {/* Meeting Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[meeting.status as keyof typeof statusColors]}`}>
                          {meeting.status.replace('_', ' ')}
                        </span>
                        {isMeetingPast(meeting.scheduled_date) && meeting.status === 'scheduled' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Overdue
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(meeting.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{meeting.scheduled_time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{meeting.client_name}</span>
                        </div>
                        {meeting.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                        {meeting.client_email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{meeting.client_email}</span>
                          </div>
                        )}
                        {meeting.client_phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{meeting.client_phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {meeting.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{meeting.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {meeting.status === 'scheduled' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(meeting.id, 'completed')}
                          disabled={updateStatusMutation.isPending}
                          className={`p-2 rounded-lg ${isDemoMode ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}`}
                          title={isDemoMode ? 'Demo mode' : 'Mark as completed'}
                          aria-disabled={isDemoMode}
                          type="button"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(meeting.id, 'no_show')}
                          disabled={updateStatusMutation.isPending}
                          className={`p-2 rounded-lg ${isDemoMode ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
                          title={isDemoMode ? 'Demo mode' : 'Mark as no show'}
                          aria-disabled={isDemoMode}
                          type="button"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {isDemoMode ? (
                      <>
                        <button
                          type="button"
                          onClick={() => notifyDemoRestriction('Editing meetings')}
                          className="p-2 text-gray-300 cursor-not-allowed"
                          aria-disabled
                          title="Demo mode"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => notifyDemoRestriction('Deleting meetings')}
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
                          to={ROUTES.dashboardMeetingEdit(meeting.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(meeting.id)}
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
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDemoMode ? 'No demo meetings available' : 'No meetings found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {isDemoMode 
                  ? 'Demo meetings will appear here automatically.'
                  : filters.search || filters.status !== 'all' || filters.dateRange !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Schedule your first meeting to get started.'}
              </p>
              {isDemoMode ? (
                <button
                  type="button"
                  onClick={() => notifyDemoRestriction('Scheduling meetings')}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg cursor-not-allowed"
                  aria-disabled
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </button>
              ) : (
                <Link
                  to={ROUTES.dashboardMeetingNew}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {meetings && meetings.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {meetings.filter(m => m.status === 'scheduled').length}
                </div>
                <div className="text-sm text-gray-500">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {meetings.filter(m => m.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {meetings.filter(m => m.status === 'no_show').length}
                </div>
                <div className="text-sm text-gray-500">No Shows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {meetings.filter(m => m.status === 'cancelled').length}
                </div>
                <div className="text-sm text-gray-500">Cancelled</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}