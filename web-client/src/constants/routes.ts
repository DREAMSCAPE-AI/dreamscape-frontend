/**
 * Application route constants
 * Centralized route definitions to avoid magic strings and typos
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  AUTH: '/auth',
  ABOUT: '/about',

  // Onboarding & Profile
  ONBOARDING: '/onboarding',
  PROFILE_SETUP: '/profile/setup',

  // Main features
  DASHBOARD: '/dashboard',
  DASHBOARD_UNIFIED: '/dashboard/unified',
  DASHBOARD_INTERCHANGEABLE: '/dashboard/interchangeable',
  PLANNER: '/planner',
  MAP: '/map',

  // Settings & Support
  SETTINGS: '/settings',
  SUPPORT: '/support',
  HELP: '/help',
  FAQ: '/faq',

  // Travel services
  HOTELS: '/hotels',
  FLIGHTS: '/flights',
  DESTINATIONS: '/destinations',
  DESTINATION: '/destination/:id',
  EXPERIENCES: '/experiences',
  EXPERIENCE: '/experiences/:id',
  ACTIVITIES: '/activities',
  ACTIVITY: '/activities/:id',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PAYMENTS: '/admin/payments',

  // API Components
  ANALYTICS: '/analytics',
  FLIGHT_STATUS: '/flight-status',
  AIRPORTS: '/airports',
  AIRLINES: '/airlines',
  TRANSFERS: '/transfers',
  INSIGHTS: '/insights',
} as const;

/**
 * Routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.AUTH,
  ROUTES.ABOUT,
  ROUTES.HELP,
  ROUTES.FAQ,
] as const;

/**
 * Routes that are exempt from onboarding requirements
 */
export const ONBOARDING_EXEMPT_ROUTES = [
  ROUTES.ONBOARDING,
  ROUTES.AUTH,
  ROUTES.SETTINGS,
  ROUTES.HELP,
  ROUTES.FAQ,
] as const;

/**
 * Helper function to build dynamic routes
 */
export const buildRoute = {
  destination: (id: string | number) => `/destination/${id}`,
  experience: (id: string | number) => `/experiences/${id}`,
  activity: (id: string | number) => `/activities/${id}`,
} as const;

export type RouteKey = keyof typeof ROUTES;
export type Route = typeof ROUTES[RouteKey];
