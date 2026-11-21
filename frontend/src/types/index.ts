export type UserRole = 'requester' | 'volunteer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export type RequestCategory =
  | 'medicine_delivery'
  | 'grocery_assistance'
  | 'transportation'
  | 'senior_citizen_support'
  | 'emergency_community_support'
  | 'other';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export type RequestStatus =
  | 'OPEN'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface AssistanceRequest {
  id: string;
  requester_id: string;
  title: string;
  description: string;
  category: RequestCategory;
  location: string;
  priority: RequestPriority;
  status: RequestStatus;
  contact_preference?: string;
  accepted_volunteer_id?: string | null;
  nexconn_channel_id?: string | null;
  notes?: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;

  requester?: User;
  volunteer?: User;
}

export interface ChatMessage {
  messageId: string;
  senderUserId: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  sentTime: number;
  isMe: boolean;
  status?: 'sending' | 'sent' | 'failed';
}

export type NexconnConnectionState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'FAILED'
  | 'CREDENTIALS_MISSING';
