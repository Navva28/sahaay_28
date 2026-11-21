import { Request, Response } from 'express';
import { nexconnService } from '../services/nexconnService.js';
import { db } from '../services/dbService.js';
import { config } from '../config/env.js';

export const chatController = {
  /**
   * Secure Token Generation Endpoint
   * Returns a Nexconn access token for the authenticated user
   */
  async issueUserToken(req: Request, res: Response) {
    try {
      const { userId, name, avatarUrl } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required to generate Nexconn token',
        });
      }

      // Check if Nexconn credentials are configured
      if (!nexconnService.hasCredentials()) {
        return res.status(428).json({
          success: false,
          code: 'NEXCONN_CREDENTIALS_REQUIRED',
          message:
            'Nexconn App Key and App Secret are required. Please configure NEXCONN_APP_KEY and NEXCONN_APP_SECRET in backend/.env',
          helpUrl: 'https://console.nexconn.ai/',
        });
      }

      const result = await nexconnService.issueUserToken({
        userId,
        name: name || userId,
        avatarUrl,
      });

      res.json({
        success: true,
        token: result.token,
        userId: result.userId,
        appKey: result.appKey,
      });
    } catch (err: any) {
      console.error('Chat token issue error:', err.message);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to issue Nexconn access token',
      });
    }
  },

  /**
   * Get Channel Information for a specific request
   * Verifies that the requesting user is authorized (requester or accepted volunteer)
   */
  async getRequestChannel(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required for channel authorization' });
      }

      const request = await db.getRequestById(requestId);
      if (!request) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }

      // Authorization check
      const isRequester = request.requester_id === userId;
      const isAssignedVolunteer = request.accepted_volunteer_id === userId;

      if (!isRequester && !isAssignedVolunteer) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You are not a participant in this assistance coordination chat.',
        });
      }

      const channelId = request.nexconn_channel_id || nexconnService.generateChannelId(requestId);

      res.json({
        success: true,
        channelId,
        requestTitle: request.title,
        status: request.status,
        participants: {
          requester: request.requester,
          volunteer: request.volunteer,
        },
        appKey: config.nexconn.appKey,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Get Nexconn public status and configuration (never exposes secret)
   */
  async getStatus(req: Request, res: Response) {
    res.json({
      success: true,
      configured: nexconnService.hasCredentials(),
      appKeyConfigured: Boolean(config.nexconn.appKey),
      appSecretConfigured: Boolean(config.nexconn.appSecret),
      appKey: config.nexconn.appKey ? `${config.nexconn.appKey.substring(0, 6)}...` : null,
      primaryDomain: config.nexconn.primaryApiDomain,
    });
  },
};
