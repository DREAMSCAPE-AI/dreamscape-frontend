import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';

const USER_API_BASE_URL = import.meta.env.VITE_USER_SERVICE_URL;

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

class NotificationService {
  private api: AxiosInstance;
  private socket: Socket | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: `${USER_API_BASE_URL}/v1/users/notifications`,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.api.interceptors.request.use((config) => {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          const token = authData?.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          console.error('[NotificationService] Failed to parse auth storage');
        }
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth-storage');
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      },
    );
  }

  async getNotifications(
    filter: 'all' | 'unread' | 'read' = 'all',
    page = 1,
    limit = 20,
  ): Promise<GetNotificationsResponse> {
    const response = await this.api.get('/', { params: { filter, page, limit } });
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.api.get('/unread-count');
    return response.data?.data?.count ?? 0;
  }

  async markAsRead(id: string): Promise<{ success: boolean; data: Notification }> {
    const response = await this.api.patch(`/${id}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<{ success: boolean; data: { updated: number } }> {
    const response = await this.api.patch('/mark-all-read');
    return response.data;
  }

  // ---- Socket.io real-time ----

  connect(): void {
    if (this.socket?.connected) return;

    const authStorage = localStorage.getItem('auth-storage');
    let token: string | undefined;
    try {
      const authData = JSON.parse(authStorage || '{}');
      token = authData?.state?.token;
    } catch {
      return;
    }

    if (!token) return;

    // Connect to the base host (without /api path) since Socket.io uses the default namespace
    const socketUrl = USER_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3002';
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[NotificationService] Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[NotificationService] Socket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[NotificationService] Socket connect error:', err.message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  onNewNotification(callback: (notification: Notification) => void): void {
    this.socket?.on('notification:new', callback);
  }

  offNewNotification(callback: (notification: Notification) => void): void {
    this.socket?.off('notification:new', callback);
  }
}

export default new NotificationService();
