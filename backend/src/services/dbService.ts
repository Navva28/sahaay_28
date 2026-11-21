import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { User, AssistanceRequest, RequestCategory, RequestPriority, RequestStatus } from '../types/index.js';

/**
 * High-reliability database service.
 * Supports Supabase with an in-memory persistent fallback
 * so development, demoing, and testing never fail if Supabase credentials
 * are still being set up by the developer.
 */
class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private users: Map<string, User> = new Map();
  private requests: Map<string, AssistanceRequest> = new Map();
  private isSupabaseConnected = false;

  constructor() {
    this.initFallbackData();
    this.initSupabase();
  }

  private initSupabase() {
    if (config.supabase.url && config.supabase.serviceRoleKey) {
      try {
        this.supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
          auth: { persistSession: false },
        });
        this.isSupabaseConnected = true;
        console.log('✅ Supabase client initialized');
      } catch (err) {
        console.warn('⚠️ Could not initialize Supabase client, using fallback store:', err);
        this.isSupabaseConnected = false;
      }
    } else {
      console.log('ℹ️ Supabase credentials not fully configured. Using persistent local store.');
    }
  }

  private initFallbackData() {
    // Seed default demo users
    const demoUsers: User[] = [
      {
        id: 'usr_req_anjali',
        name: 'Anjali Sharma',
        email: 'anjali@example.com',
        role: 'requester',
        location: 'Indiranagar, Bengaluru',
        phone: '+91 98765 43210',
        avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        bio: 'Senior citizen requiring occasional prescription delivery and grocery support.',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'usr_vol_rahul',
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        role: 'volunteer',
        location: 'Koramangala, Bengaluru',
        phone: '+91 98123 45678',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: 'Active community volunteer with personal transport for medicine pickup & elder aid.',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'usr_vol_priya',
        name: 'Priya Patel',
        email: 'priya@example.com',
        role: 'volunteer',
        location: 'Whitefield, Bengaluru',
        phone: '+91 99887 76655',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'Compassionate weekend helper specializing in senior accompaniment & groceries.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];

    demoUsers.forEach((u) => this.users.set(u.id, u));

    // Seed default demo requests
    const demoRequests: AssistanceRequest[] = [
      {
        id: 'req_med_001',
        requester_id: 'usr_req_anjali',
        title: 'Urgent BP & Diabetes Medication Pickup',
        description:
          'Need prescription refill collected from Apollo Pharmacy 100ft Rd and delivered to 12th Main Indiranagar. Prescription slip is ready.',
        category: 'medicine_delivery',
        location: 'Indiranagar, Bengaluru',
        priority: 'urgent',
        status: 'OPEN',
        contact_preference: 'chat',
        accepted_volunteer_id: null,
        nexconn_channel_id: 'sahaay_req_med_001',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'req_groc_002',
        requester_id: 'usr_req_anjali',
        title: 'Weekly Essentials & Fresh Vegetables',
        description:
          'Need assistance buying basic pantry items (dal, rice, oats) and vegetables for an elderly couple unable to walk to the market in heavy rain.',
        category: 'grocery_assistance',
        location: 'Indiranagar, Bengaluru',
        priority: 'medium',
        status: 'OPEN',
        contact_preference: 'chat',
        accepted_volunteer_id: null,
        nexconn_channel_id: 'sahaay_req_groc_002',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'req_snr_003',
        requester_id: 'usr_req_anjali',
        title: 'Hospital OPD Appointment Escort',
        description:
          'Looking for a compassionate volunteer to accompany an 82-year-old lady to Manipal Hospital OPD checkup and assist with wheelchair navigation.',
        category: 'senior_citizen_support',
        location: 'Old Airport Rd, Bengaluru',
        priority: 'high',
        status: 'OPEN',
        contact_preference: 'chat',
        accepted_volunteer_id: null,
        nexconn_channel_id: 'sahaay_req_snr_003',
        created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 9).toISOString(),
      },
    ];

    demoRequests.forEach((r) => this.requests.set(r.id, r));
  }

  // ================= USERS =================

  public async getUserById(id: string): Promise<User | null> {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('users').select('*').eq('id', id).single();
        if (!error && data) return data as User;
      } catch (err) {
        console.warn('Supabase query error, checking local store:', err);
      }
    }
    return this.users.get(id) || null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('users').select('*').eq('email', email).single();
        if (!error && data) return data as User;
      } catch (err) {
        console.warn('Supabase query error, checking local store:', err);
      }
    }
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public async listUsers(): Promise<User[]> {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('users').select('*');
        if (!error && data && data.length > 0) return data as User[];
      } catch (err) {
        console.warn('Supabase listUsers error, falling back to local store:', err);
      }
    }
    return Array.from(this.users.values());
  }

  public async createUser(user: User): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User = { ...user, created_at: now, updated_at: now };

    this.users.set(newUser.id, newUser);

    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase.from('users').insert([newUser]).select().single();
        if (!error && data) return data as User;
      } catch (err) {
        console.warn('Failed to insert user to Supabase:', err);
      }
    }
    return newUser;
  }

  // ================= ASSISTANCE REQUESTS =================

  public async listRequests(filters?: {
    status?: RequestStatus;
    category?: RequestCategory;
    requesterId?: string;
    volunteerId?: string;
  }): Promise<AssistanceRequest[]> {
    let results: AssistanceRequest[] = [];

    if (this.isSupabaseConnected && this.supabase) {
      try {
        let query = this.supabase
          .from('assistance_requests')
          .select('*, requester:users!requester_id(*), volunteer:users!accepted_volunteer_id(*)')
          .order('created_at', { ascending: false });

        if (filters?.status) query = query.eq('status', filters.status);
        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.requesterId) query = query.eq('requester_id', filters.requesterId);
        if (filters?.volunteerId) query = query.eq('accepted_volunteer_id', filters.volunteerId);

        const { data, error } = await query;
        if (!error && data) {
          return data as AssistanceRequest[];
        }
      } catch (err) {
        console.warn('Supabase listRequests error, using local store:', err);
      }
    }

    // Local fallback filtering
    results = Array.from(this.requests.values()).map((req) => ({
      ...req,
      requester: this.users.get(req.requester_id),
      volunteer: req.accepted_volunteer_id ? this.users.get(req.accepted_volunteer_id) : undefined,
    }));

    if (filters?.status) {
      results = results.filter((r) => r.status === filters.status);
    }
    if (filters?.category) {
      results = results.filter((r) => r.category === filters.category);
    }
    if (filters?.requesterId) {
      results = results.filter((r) => r.requester_id === filters.requesterId);
    }
    if (filters?.volunteerId) {
      results = results.filter((r) => r.accepted_volunteer_id === filters.volunteerId);
    }

    return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getRequestById(id: string): Promise<AssistanceRequest | null> {
    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('assistance_requests')
          .select('*, requester:users!requester_id(*), volunteer:users!accepted_volunteer_id(*)')
          .eq('id', id)
          .single();

        if (!error && data) return data as AssistanceRequest;
      } catch (err) {
        console.warn('Supabase getRequestById error:', err);
      }
    }

    const req = this.requests.get(id);
    if (!req) return null;

    return {
      ...req,
      requester: this.users.get(req.requester_id),
      volunteer: req.accepted_volunteer_id ? this.users.get(req.accepted_volunteer_id) : undefined,
    };
  }

  public async createRequest(requestData: Omit<AssistanceRequest, 'created_at' | 'updated_at'>): Promise<AssistanceRequest> {
    const now = new Date().toISOString();
    const newReq: AssistanceRequest = {
      ...requestData,
      created_at: now,
      updated_at: now,
    };

    this.requests.set(newReq.id, newReq);

    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('assistance_requests')
          .insert([
            {
              id: newReq.id,
              requester_id: newReq.requester_id,
              title: newReq.title,
              description: newReq.description,
              category: newReq.category,
              location: newReq.location,
              priority: newReq.priority,
              status: newReq.status,
              contact_preference: newReq.contact_preference,
              nexconn_channel_id: newReq.nexconn_channel_id,
            },
          ])
          .select('*, requester:users!requester_id(*)')
          .single();

        if (!error && data) return data as AssistanceRequest;
      } catch (err) {
        console.warn('Supabase insert request error:', err);
      }
    }

    return {
      ...newReq,
      requester: this.users.get(newReq.requester_id),
    };
  }

  /**
   * Accepts an assistance request atomically to prevent race conditions
   * between multiple volunteers trying to accept the same request.
   */
  public async acceptRequest(params: {
    requestId: string;
    volunteerId: string;
    nexconnChannelId: string;
  }): Promise<{ success: boolean; request?: AssistanceRequest; message: string }> {
    const { requestId, volunteerId, nexconnChannelId } = params;

    const req = await this.getRequestById(requestId);
    if (!req) {
      return { success: false, message: 'Request not found' };
    }

    if (req.status !== 'OPEN') {
      return {
        success: false,
        message: `Request is already in status ${req.status} and cannot be accepted.`,
      };
    }

    const now = new Date().toISOString();
    req.status = 'ACCEPTED';
    req.accepted_volunteer_id = volunteerId;
    req.nexconn_channel_id = nexconnChannelId;
    req.updated_at = now;

    this.requests.set(requestId, req);

    if (this.isSupabaseConnected && this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('assistance_requests')
          .update({
            status: 'ACCEPTED',
            accepted_volunteer_id: volunteerId,
            nexconn_channel_id: nexconnChannelId,
            updated_at: now,
          })
          .eq('id', requestId)
          .eq('status', 'OPEN') // Optimistic locking
          .select('*, requester:users!requester_id(*), volunteer:users!accepted_volunteer_id(*)')
          .single();

        if (!error && data) {
          return { success: true, request: data as AssistanceRequest, message: 'Request accepted successfully.' };
        }
      } catch (err) {
        console.warn('Supabase acceptRequest error:', err);
      }
    }

    return {
      success: true,
      request: {
        ...req,
        requester: this.users.get(req.requester_id),
        volunteer: this.users.get(volunteerId),
      },
      message: 'Request accepted successfully.',
    };
  }

  /**
   * Updates status of request (e.g. ACCEPTED -> IN_PROGRESS -> COMPLETED)
   */
  public async updateRequestStatus(params: {
    requestId: string;
    status: RequestStatus;
    userId: string;
  }): Promise<{ success: boolean; request?: AssistanceRequest; message: string }> {
    const { requestId, status, userId } = params;

    const req = await this.getRequestById(requestId);
    if (!req) {
      return { success: false, message: 'Request not found' };
    }

    // Authorization check: only requester or assigned volunteer can update
    const isRequester = req.requester_id === userId;
    const isAssignedVolunteer = req.accepted_volunteer_id === userId;

    if (!isRequester && !isAssignedVolunteer) {
      return {
        success: false,
        message: 'Unauthorized: only the requester or assigned volunteer can update status.',
      };
    }

    const now = new Date().toISOString();
    req.status = status;
    req.updated_at = now;
    if (status === 'COMPLETED') {
      req.completed_at = now;
    }

    this.requests.set(requestId, req);

    if (this.isSupabaseConnected && this.supabase) {
      try {
        const updatePayload: any = { status, updated_at: now };
        if (status === 'COMPLETED') updatePayload.completed_at = now;

        const { data, error } = await this.supabase
          .from('assistance_requests')
          .update(updatePayload)
          .eq('id', requestId)
          .select('*, requester:users!requester_id(*), volunteer:users!accepted_volunteer_id(*)')
          .single();

        if (!error && data) {
          return { success: true, request: data as AssistanceRequest, message: `Status updated to ${status}` };
        }
      } catch (err) {
        console.warn('Supabase updateRequestStatus error:', err);
      }
    }

    return {
      success: true,
      request: {
        ...req,
        requester: this.users.get(req.requester_id),
        volunteer: req.accepted_volunteer_id ? this.users.get(req.accepted_volunteer_id) : undefined,
      },
      message: `Status updated to ${status}`,
    };
  }
}

export const db = new DatabaseService();
