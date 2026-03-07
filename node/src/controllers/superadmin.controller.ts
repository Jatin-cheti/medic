import { Request, Response, NextFunction } from 'express';
import SuperAdminService from '../services/superadmin.service';

class SuperAdminController {
  async addAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      const admin = await SuperAdminService.addAdmin(name, email, password);
      res.status(201).json({ message: 'Admin created successfully', admin });
    } catch (error) {
      next(error);
    }
  }

  async removeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { adminId } = req.params;

      if (!adminId) {
        return res.status(400).json({ message: 'Admin ID is required' });
      }

      const result = await SuperAdminService.removeAdmin(parseInt(adminId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new SuperAdminController();
