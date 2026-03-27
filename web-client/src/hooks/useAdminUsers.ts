import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '@/services/admin/AdminUserService';
import type { UpdateUserData, SuspendUserData } from '@/types/admin';

interface UseAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'suspended';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useAdminUsers = (params: UseAdminUsersParams = {}) =>
  useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminUserService.listUsers(params),
  });

export const useAdminUser = (id: string | null) =>
  useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminUserService.getUser(id!),
    enabled: !!id,
  });

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      adminUserService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminUserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SuspendUserData }) =>
      adminUserService.suspendUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminUserService.reactivateUser(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

export const useUserActivity = (id: string | null, page = 1, limit = 20) =>
  useQuery({
    queryKey: ['admin', 'users', id, 'activity', page],
    queryFn: () => adminUserService.getUserActivity(id!, page, limit),
    enabled: !!id,
  });
