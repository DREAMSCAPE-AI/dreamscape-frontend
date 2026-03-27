import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '@/services/admin/AdminUserService';
import type { UpdateUserData } from '@/types/admin';

interface UseAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const useAdminUsers = (params: UseAdminUsersParams = {}) =>
  useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminUserService.listUsers(params),
  });

export const useAdminUser = (id: string) =>
  useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminUserService.getUser(id),
    enabled: !!id,
  });

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      adminUserService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
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
