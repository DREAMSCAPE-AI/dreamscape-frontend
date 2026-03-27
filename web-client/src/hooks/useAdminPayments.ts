import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPaymentService } from '@/services/admin/AdminPaymentService';

interface ListPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export function useAdminPayments(params: ListPaymentsParams = {}) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => adminPaymentService.listPayments(params),
    staleTime: 30_000,
  });
}

export function useAdminPayment(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'payments', id],
    queryFn: () => adminPaymentService.getPayment(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminPaymentService.updatePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
    },
  });
}
