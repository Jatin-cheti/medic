import { Request, Response, NextFunction } from 'express';
import { SuperAdminService } from '../services/superAdminService';

export class SuperAdminController {
  static async addAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await SuperAdminService.addAdmin({ name, email, password });
      res.status(201).json({ message: 'Admin added successfully', admin: result });
    } catch (error) {
      next(error);
    }
  }

  static async removeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await SuperAdminService.removeAdmin(parseInt(id, 10));
      res.status(200).json({ message: 'Admin removed successfully' });
    } catch (error) {
      next(error);
    }
  }
}
