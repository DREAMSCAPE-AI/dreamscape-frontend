import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminBookingService } from '@/services/admin/AdminBookingService';
import type { CancelBookingData, ModifyBookingData } from '@/types/admin';

interface UseAdminBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minAmount?: number;
  maxAmount?: number;
  destination?: string;
}

export function useAdminBookings(params: UseAdminBookingsParams = {}) {
  return useQuery({
    queryKey: ['admin', 'bookings', params],
    queryFn: () => adminBookingService.listBookings(params),
    staleTime: 30_000,
  });
}

export function useAdminBooking(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'bookings', id],
    queryFn: () => adminBookingService.getBooking(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminBookingService.updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}

export function useBulkUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      adminBookingService.bulkUpdateBookingStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelBookingData }) =>
      adminBookingService.cancelBooking(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', id] });
    },
  });
}

export function useModifyBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModifyBookingData }) =>
      adminBookingService.modifyBooking(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings', id] });
    },
  });
}

export function useResendEmail() {
  return useMutation({
    mutationFn: (id: string) => adminBookingService.resendEmail(id),
  });
}
