export const ROUTES = {
  landing: '/',
  pricing: '/pricing',
  demo: '/demo',
  auth: '/auth',
  dashboard: '/dashboard',
  dashboardProducts: '/dashboard/products',
  dashboardProductNew: '/dashboard/products/new',
  dashboardProductDetail: (id: string) => `/dashboard/products/${id}`,
  dashboardProductEdit: (id: string) => `/dashboard/products/${id}/edit`,
  dashboardMeetings: '/dashboard/meetings',
  dashboardMeetingNew: '/dashboard/meetings/new',
  dashboardMeetingDetail: (id: string) => `/dashboard/meetings/${id}`,
  dashboardMeetingEdit: (id: string) => `/dashboard/meetings/${id}/edit`,
  dashboardAnalytics: '/dashboard/analytics',
  dashboardSettings: '/dashboard/settings',
  dashboardHelp: '/dashboard/help'
} as const;

export type RouteValue = typeof ROUTES[keyof typeof ROUTES];
