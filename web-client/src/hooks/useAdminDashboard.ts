import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDashboardService } from '@/services/admin/AdminDashboardService';
import type { PeriodType } from '@/types/admin';

const REFETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useAdminStats = (period: PeriodType, startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['admin', 'stats', period, startDate, endDate],
    queryFn: () => adminDashboardService.getStats(period, startDate, endDate),
    refetchInterval: REFETCH_INTERVAL,
  });

export const useRevenueChart = (period: PeriodType, startDate?: string, endDate?: string) =>
  useQuery({
    queryKey: ['admin', 'revenue-chart', period, startDate, endDate],
    queryFn: () => adminDashboardService.getRevenueChart(period, startDate, endDate),
    refetchInterval: REFETCH_INTERVAL,
  });

export const useBookingsByDestination = (limit: number = 5) =>
  useQuery({
    queryKey: ['admin', 'bookings-by-destination', limit],
    queryFn: () => adminDashboardService.getBookingsByDestination(limit),
    refetchInterval: REFETCH_INTERVAL,
  });

export const useRecentTransactions = (limit: number = 10) =>
  useQuery({
    queryKey: ['admin', 'recent-transactions', limit],
    queryFn: () => adminDashboardService.getRecentTransactions(limit),
    refetchInterval: REFETCH_INTERVAL,
  });

export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin'] });
};
