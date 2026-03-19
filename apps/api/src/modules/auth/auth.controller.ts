import { Request, Response } from 'express';
import { authService } from './auth.service';
import { RegisterRequestSchema, LoginRequestSchema } from '@codepilot/shared';
import { AuthRequest } from '../../middleware/auth';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = RegisterRequestSchema.parse(req.body);
      const result = await authService.register(data.email, data.password, data.name);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Registration failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = LoginRequestSchema.parse(req.body);
      const result = await authService.login(data.email, data.password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : 'Login failed' });
    }
  }

  async logout(req: Request, res: Response) {
    res.json({ message: 'Logged out successfully' });
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error instanceof Error ? error.message : 'Token refresh failed' });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      const user = await authService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user info' });
    }
  }
}

export const authController = new AuthController();
