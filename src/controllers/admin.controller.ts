import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { validationResult } from 'express-validator';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  public addAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;
      const result = await this.adminService.addAdmin(name, email, password);
      res.status(201).json({ message: 'Admin added successfully', admin: result });
    } catch (error) {
      next(error);
    }
  };

  public removeAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { adminId } = req.params;
      await this.adminService.removeAdmin(parseInt(adminId, 10));
      res.status(200).json({ message: 'Admin removed successfully' });
    } catch (error) {
      next(error);
    }
  };
}
