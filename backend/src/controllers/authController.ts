import { Request, Response } from 'express';
import { db } from '../services/dbService.js';
import { User, UserRole } from '../types/index.js';

export const authController = {
  /**
   * List all users (useful for quick switcher in MVP demo)
   */
  async listUsers(req: Request, res: Response) {
    try {
      const users = await db.listUsers();
      res.json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Get user profile by ID
   */
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await db.getUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Demo login / registration
   * Accepts email, name, role ('requester' | 'volunteer'), location
   */
  async loginOrRegister(req: Request, res: Response) {
    try {
      const { email, name, role = 'requester', location = 'Bengaluru', phone, bio } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }

      // Check if user already exists
      let user = await db.getUserByEmail(email);

      if (!user) {
        // Register new user
        const newUserId = `usr_${role}_${Date.now().toString(36)}`;
        const newUser: User = {
          id: newUserId,
          name: name || email.split('@')[0],
          email: email.toLowerCase().trim(),
          role: role as UserRole,
          location,
          phone,
          bio,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
        };
        user = await db.createUser(newUser);
      }

      res.json({
        success: true,
        user,
        message: 'Authenticated successfully',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
