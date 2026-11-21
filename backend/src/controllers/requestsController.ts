import { Request, Response } from 'express';
import { db } from '../services/dbService.js';
import { nexconnService } from '../services/nexconnService.js';
import { RequestCategory, RequestPriority, RequestStatus } from '../types/index.js';

export const requestsController = {
  /**
   * List assistance requests with optional filters
   */
  async listRequests(req: Request, res: Response) {
    try {
      const { status, category, requesterId, volunteerId } = req.query;

      const requests = await db.listRequests({
        status: status as RequestStatus | undefined,
        category: category as RequestCategory | undefined,
        requesterId: requesterId as string | undefined,
        volunteerId: volunteerId as string | undefined,
      });

      res.json({ success: true, count: requests.length, requests });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Get single request by ID
   */
  async getRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const request = await db.getRequestById(id);

      if (!request) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }

      res.json({ success: true, request });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Create a new assistance request
   */
  async createRequest(req: Request, res: Response) {
    try {
      const {
        requester_id,
        title,
        description,
        category,
        location,
        priority = 'medium',
        contact_preference = 'chat',
        notes,
      } = req.body;

      if (!requester_id || !title || !description || !category || !location) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: requester_id, title, description, category, location',
        });
      }

      // Generate unique request ID and channel ID
      const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const nexconnChannelId = nexconnService.generateChannelId(requestId);

      const newRequest = await db.createRequest({
        id: requestId,
        requester_id,
        title,
        description,
        category,
        location,
        priority,
        status: 'OPEN',
        contact_preference,
        accepted_volunteer_id: null,
        nexconn_channel_id: nexconnChannelId,
        notes,
        completed_at: null,
      });

      res.status(201).json({
        success: true,
        request: newRequest,
        message: 'Assistance request created successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Volunteer accepts an assistance request
   */
  async acceptRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { volunteer_id } = req.body;

      if (!volunteer_id) {
        return res.status(400).json({ success: false, error: 'volunteer_id is required' });
      }

      // Validate volunteer
      const volunteer = await db.getUserById(volunteer_id);
      if (!volunteer) {
        return res.status(404).json({ success: false, error: 'Volunteer not found' });
      }

      const channelId = nexconnService.generateChannelId(id);

      const result = await db.acceptRequest({
        requestId: id,
        volunteerId: volunteer_id,
        nexconnChannelId: channelId,
      });

      if (!result.success) {
        return res.status(409).json(result);
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Update request status (e.g. IN_PROGRESS, COMPLETED, CANCELLED)
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, user_id } = req.body;

      if (!status || !user_id) {
        return res.status(400).json({ success: false, error: 'status and user_id are required' });
      }

      const validStatuses: RequestStatus[] = ['OPEN', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
      }

      const result = await db.updateRequestStatus({
        requestId: id,
        status,
        userId: user_id,
      });

      if (!result.success) {
        return res.status(403).json(result);
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
