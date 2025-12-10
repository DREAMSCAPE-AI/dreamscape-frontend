/**
 * DEPRECATED: This file is maintained for backward compatibility only.
 *
 * Please use service-specific imports instead:
 *
 * - For authentication: import { useAuth, authApiService } from '@/services/auth/AuthService'
 * - For user profile: import { profileService } from '@/services/profile'
 * - For voyage (flights, hotels, activities, etc.): import voyageService from '@/services/api/VoyageService'
 *
 * This file will be removed in a future version.
 */

// Re-export services for gradual migration
export { useAuth, authApiService } from './auth/AuthService';
export { default as voyageService } from './api/VoyageService';
export { profileService } from './profile';

// Re-export types
export type * from './api/types';
export type * from './auth/types';

// Default export for backward compatibility (points to voyage service)
export { default } from './api/VoyageService';
