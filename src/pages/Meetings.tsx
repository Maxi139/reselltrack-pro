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
    scheduled: 'bg-blue-100 text-blue-900 border border-blue-200',
    completed: 'bg-green-100 text-green-900 border border-green-200',
    cancelled: 'bg-red-100 text-red-900 border border-red-200',
    no_show: 'bg-gray-100 text-gray-900 border border-gray-200'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8 animate-pulse">
            <div>
              <div className="h-10 bg-slate-200 dark:bg-dark-700 rounded-lg w-48 mb-2"></div>
              <div className="h-5 bg-slate-200 dark:bg-dark-700 rounded w-64"></div>
            </div>
            <div className="h-12 bg-slate-200 dark:bg-dark-700 rounded-xl w-40"></div>
          </div>

          {/* Filter Skeleton */}
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/30 dark:border-dark-700/50 p-4 sm:p-6 mb-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 sm:h-12 bg-slate-200 dark:bg-dark-700 rounded-xl"></div>
              ))}
            </div>
          </div>

          {/* Meeting Cards Skeleton */}
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/30 dark:border-dark-700/50 p-4 sm:p-6 animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    {/* Icon Skeleton */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-dark-700 rounded-full flex-shrink-0"></div>
                    
                    {/* Content Skeleton */}
                    <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                        <div className="h-5 sm:h-6 bg-slate-200 dark:bg-dark-700 rounded w-32 sm:w-48"></div>
                        <div className="h-4 sm:h-5 bg-slate-200 dark:bg-dark-700 rounded w-16 sm:w-20"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        {[1, 2, 3, 4].map(j => (
                          <div key={j} className="flex items-center space-x-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-200 dark:bg-dark-700 rounded"></div>
                            <div className="h-3 sm:h-4 bg-slate-200 dark:bg-dark-700 rounded w-20 sm:w-24"></div>
                          </div>
                        ))}
                      </div>
                      <div className="h-12 sm:h-16 bg-slate-200 dark:bg-dark-700 rounded-xl w-full"></div>
                    </div>
                  </div>
                  
                  {/* Actions Skeleton */}
                  <div className="flex items-center space-x-1 sm:space-x-2 self-start sm:self-auto">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-dark-700 rounded-lg"></div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-dark-700 rounded-lg"></div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 dark:bg-dark-700 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Skeleton */}
          <div className="mt-4 sm:mt-6 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/30 dark:border-dark-700/50 p-4 sm:p-6 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center">
                  <div className="h-6 sm:h-8 bg-slate-200 dark:bg-dark-700 rounded w-8 sm:w-12 mx-auto mb-1 sm:mb-2"></div>
                  <div className="h-3 sm:h-4 bg-slate-200 dark:bg-dark-700 rounded w-16 sm:w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xl:px-12 xl:py-16">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-8 xl:mb-12 animate-fade-in-up gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-slate-900 dark:text-white mb-2">
              Meetings
            </h1>
            <p className="text-base sm:text-lg xl:text-xl text-slate-600 dark:text-slate-300 leading-relaxed xl:leading-relaxed">
              {isDemoMode ? 'Viewing demo meetings with sample data' : 'Schedule and manage your client meetings efficiently'}
            </p>
          </div>
          {isDemoMode ? (
            <button
              type="button"
              onClick={() => notifyDemoRestriction('Scheduling meetings')}
              className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-xl cursor-not-allowed transition-all duration-200 hover:shadow-md xl:px-8 xl:py-4 xl:text-lg"
              aria-disabled
              title="Demo mode - upgrade to Pro to schedule meetings"
            >
              <Plus className="h-5 w-5 mr-2 xl:h-6 xl:w-6 xl:mr-3" />
              Schedule Meeting
            </button>
          ) : (
            <Link
              to={ROUTES.dashboardMeetingNew}
              className="inline-flex items-center px-6 py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:scale-105 transition-all duration-200 shadow-glow group xl:px-8 xl:py-4 xl:text-lg"
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform xl:h-6 xl:w-6 xl:mr-3" />
              Schedule Meeting
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 xl:p-8 xl:mb-10">
          <h2 className="text-base sm:text-lg xl:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 xl:mb-6">Filter Meetings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 xl:gap-6">
            {/* Search */}
            <div className="relative">
              <label htmlFor="meeting-search" className="block text-sm font-medium text-gray-700 mb-2 xl:text-base">
                Search Meetings
              </label>
              <div className="relative">
                <input
                  id="meeting-search"
                  type="text"
                  placeholder="Search by title, client name, or location..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent xl:pl-12 xl:pr-4 xl:py-2.5 xl:text-base"
                  aria-describedby="search-help"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none xl:pl-4">
                  <span className="text-gray-400">
                    <svg className="h-5 w-5 xl:h-6 xl:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
              </div>
              <p id="search-help" className="mt-1 text-sm text-gray-500 xl:text-base">
                Search by meeting title, client name, or location
              </p>
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2 xl:text-base">
                Meeting Status
              </label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent xl:px-4 xl:py-2.5 xl:text-base"
                aria-label="Filter meetings by status"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 xl:text-base">
                Filter by meeting status
              </p>
            </div>
            
            {/* Date Range Filter */}
            <div>
              <label htmlFor="date-range-filter" className="block text-sm font-medium text-gray-700 mb-2 xl:text-base">
                Date Range
              </label>
              <select
                id="date-range-filter"
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent xl:px-4 xl:py-2.5 xl:text-base"
                aria-label="Filter meetings by date range"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 xl:text-base">
                Filter by scheduled date
              </p>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(filters.search || filters.status !== 'all' || filters.dateRange !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Search: "{filters.search}"
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.status !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      Status: {filters.status.replace('_', ' ')}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                        className="ml-2 text-green-600 hover:text-green-800"
                        aria-label="Clear status filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.dateRange !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      Date: {filters.dateRange.replace('_', ' ')}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, dateRange: 'all' }))}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                        aria-label="Clear date filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setFilters({ search: '', status: 'all', dateRange: 'all' })}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Meetings List */}
        <div className="space-y-3 sm:space-y-4 xl:space-y-6">
          {meetings && meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow xl:p-8 xl:hover:shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 xl:gap-6">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 xl:space-x-6">
                    {/* Meeting Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 rounded-full flex items-center justify-center ${statusColors[meeting.status as keyof typeof statusColors]}`}>
                        {getStatusIcon(meeting.status)}
                      </div>
                    </div>
                    
                    {/* Meeting Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0 mb-2 xl:mb-4">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 xl:text-xl">{meeting.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium xl:px-3 xl:py-1.5 xl:text-sm ${statusColors[meeting.status as keyof typeof statusColors]}`}>
                          {meeting.status.replace('_', ' ')}
                        </span>
                        {isMeetingPast(meeting.scheduled_date) && meeting.status === 'scheduled' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 xl:px-3 xl:py-1.5 xl:text-sm">
                            Overdue
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-gray-600 xl:text-base xl:gap-6">
                        <div className="flex items-center space-x-2 xl:space-x-3">
                          <Calendar className="h-4 w-4 text-gray-400 xl:h-5 xl:w-5" />
                          <span>{formatDate(meeting.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 xl:space-x-3">
                          <Clock className="h-4 w-4 text-gray-400 xl:h-5 xl:w-5" />
                          <span>{meeting.scheduled_time}</span>
                        </div>
                        <div className="flex items-center space-x-2 xl:space-x-3">
                          <User className="h-4 w-4 text-gray-400 xl:h-5 xl:w-5" />
                          <span>{meeting.client_name}</span>
                        </div>
                        {meeting.location && (
                          <div className="flex items-center space-x-2 xl:space-x-3">
                            <MapPin className="h-4 w-4 text-gray-400 xl:h-5 xl:w-5" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                        {meeting.client_email && (
                          <div className="flex items-center space-x-2 xl:space-x-3">
                            <Mail className="h-4 w-4 text-gray-400 xl:h-5 xl:w-5" />
                            <span>{meeting.client_email}</span>
                          </div>
                        )}
                        {meeting.client_phone && (
                          <div className="flex items-center space-x-2 xl:space-x-3">
                            <Phone className="h-4 w-4 text-gray-400 xl:h-5 xl:w-5" />
                            <span>{meeting.client_phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {meeting.notes && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg xl:mt-4 xl:p-4">
                          <p className="text-sm text-gray-700 xl:text-base">{meeting.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1 sm:space-x-2 self-start sm:self-auto xl:space-x-3">
                    {meeting.status === 'scheduled' && (
                      <div className="flex items-center space-x-1 sm:space-x-2 xl:space-x-3">
                        <button
              onClick={() => handleStatusUpdate(meeting.id, 'completed')}
              disabled={updateStatusMutation.isPending}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 xl:p-2.5 ${isDemoMode ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-50 hover:text-green-700'}`}
              title={isDemoMode ? 'Demo mode' : 'Mark as completed'}
              aria-disabled={isDemoMode}
              type="button"
              aria-label="Mark meeting as completed"
            >
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
            </button>
            <button
              onClick={() => handleStatusUpdate(meeting.id, 'no_show')}
              disabled={updateStatusMutation.isPending}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 xl:p-2.5 ${isDemoMode ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'}`}
              title={isDemoMode ? 'Demo mode' : 'Mark as no show'}
              aria-disabled={isDemoMode}
              type="button"
              aria-label="Mark meeting as no show"
            >
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
            </button>
                      </div>
                    )}
                    {isDemoMode ? (
                      <>
                        <button
                          type="button"
                          onClick={() => notifyDemoRestriction('Editing meetings')}
                          className="p-1.5 sm:p-2 text-gray-300 cursor-not-allowed xl:p-2.5"
                          aria-disabled
                          title="Demo mode"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => notifyDemoRestriction('Deleting meetings')}
                          className="p-1.5 sm:p-2 text-gray-300 cursor-not-allowed xl:p-2.5"
                          aria-disabled
                          title="Demo mode"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={ROUTES.dashboardMeetingEdit(meeting.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 xl:p-2.5"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(meeting.id)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 xl:p-2.5"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 xl:h-5 xl:w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg rounded-2xl shadow-glass border border-white/30 dark:border-dark-700/50 p-6 sm:p-12 text-center">
              {/* Enhanced Empty State Illustration */}
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow animate-bounce-in">
                <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-300" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                {isDemoMode ? 'No Demo Meetings' : 'No Meetings Found'}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                {isDemoMode 
                  ? 'Demo meetings will appear here automatically to showcase the meeting management features.'
                  : filters.search || filters.status !== 'all' || filters.dateRange !== 'all'
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                  : 'Get started by scheduling your first client meeting. Organize your appointments and never miss an important meeting again.'}
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {isDemoMode ? (
                  <button
                    type="button"
                    onClick={() => notifyDemoRestriction('Scheduling meetings')}
                    className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-600 font-semibold rounded-lg sm:rounded-xl cursor-not-allowed transition-all duration-200 hover:shadow-md text-sm sm:text-base"
                    aria-disabled
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Schedule Meeting
                  </button>
                ) : (
                  <Link
                    to={ROUTES.dashboardMeetingNew}
                    className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-primary text-white font-semibold rounded-lg sm:rounded-xl hover:scale-105 transition-all duration-200 shadow-glow group text-sm sm:text-base"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:rotate-90 transition-transform" />
                    Schedule Meeting
                  </Link>
                )}
                
                {/* Helpful Links */}
                {!isDemoMode && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    <button 
                      onClick={() => setFilters({ search: '', status: 'all', dateRange: 'all' })}
                      className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Clear all filters
                    </button>
                    <span className="hidden sm:inline">•</span>
                    <Link 
                      to={ROUTES.dashboard}
                      className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {meetings && meetings.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {meetings.filter(m => m.status === 'scheduled').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {meetings.filter(m => m.status === 'completed').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-600">
                  {meetings.filter(m => m.status === 'no_show').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">No Shows</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {meetings.filter(m => m.status === 'cancelled').length}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Cancelled</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}