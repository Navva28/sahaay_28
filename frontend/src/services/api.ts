import { AssistanceRequest, RequestCategory, RequestStatus, User, UserRole } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  auth: {
    async getUsers(): Promise<User[]> {
      const res = await fetch(`${API_BASE_URL}/api/auth/users`);
      const data = await handleResponse<{ success: boolean; users: User[] }>(res);
      return data.users;
    },

    async getUser(id: string): Promise<User> {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`);
      const data = await handleResponse<{ success: boolean; user: User }>(res);
      return data.user;
    },

    async login(payload: { email: string; name?: string; role?: UserRole; location?: string }): Promise<User> {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse<{ success: boolean; user: User }>(res);
      return data.user;
    },
  },

  requests: {
    async getRequests(filters?: {
      status?: RequestStatus;
      category?: RequestCategory;
      requesterId?: string;
      volunteerId?: string;
    }): Promise<AssistanceRequest[]> {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.requesterId) params.append('requesterId', filters.requesterId);
      if (filters?.volunteerId) params.append('volunteerId', filters.volunteerId);

      const res = await fetch(`${API_BASE_URL}/api/requests?${params.toString()}`);
      const data = await handleResponse<{ success: boolean; requests: AssistanceRequest[] }>(res);
      return data.requests;
    },

    async getRequest(id: string): Promise<AssistanceRequest> {
      const res = await fetch(`${API_BASE_URL}/api/requests/${id}`);
      const data = await handleResponse<{ success: boolean; request: AssistanceRequest }>(res);
      return data.request;
    },

    async createRequest(payload: Partial<AssistanceRequest>): Promise<AssistanceRequest> {
      const res = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse<{ success: boolean; request: AssistanceRequest }>(res);
      return data.request;
    },

    async acceptRequest(id: string, volunteerId: string): Promise<AssistanceRequest> {
      const res = await fetch(`${API_BASE_URL}/api/requests/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id: volunteerId }),
      });
      const data = await handleResponse<{ success: boolean; request: AssistanceRequest }>(res);
      return data.request;
    },

    async updateStatus(id: string, status: RequestStatus, userId: string): Promise<AssistanceRequest> {
      const res = await fetch(`${API_BASE_URL}/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, user_id: userId }),
      });
      const data = await handleResponse<{ success: boolean; request: AssistanceRequest }>(res);
      return data.request;
    },
  },

  chat: {
    async issueToken(userId: string, name?: string, avatarUrl?: string): Promise<{ token: string; appKey: string }> {
      const res = await fetch(`${API_BASE_URL}/api/chat/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, avatarUrl }),
      });
      const data = await handleResponse<{ success: boolean; token: string; appKey: string; code?: string }>(res);
      return { token: data.token, appKey: data.appKey };
    },

    async getChannel(requestId: string, userId: string): Promise<{
      channelId: string;
      requestTitle: string;
      status: RequestStatus;
      appKey: string;
      participants: { requester?: User; volunteer?: User };
    }> {
      const res = await fetch(`${API_BASE_URL}/api/chat/channel/${requestId}?userId=${encodeURIComponent(userId)}`);
      return handleResponse(res);
    },

    async getStatus(): Promise<{
      configured: boolean;
      appKeyConfigured: boolean;
      appSecretConfigured: boolean;
      appKey: string | null;
    }> {
      const res = await fetch(`${API_BASE_URL}/api/chat/status`);
      return handleResponse(res);
    },
  },
};
