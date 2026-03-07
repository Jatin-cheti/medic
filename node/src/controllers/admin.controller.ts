import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  public getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.query;
      const users = await this.adminService.getAllUsers(role as string);
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  };

  public verifyDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { doctorId, status, comments } = req.body;
      await this.adminService.verifyDoctor(doctorId, status, comments);
      res.status(200).json({ success: true, message: 'Doctor verification updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  public addAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      await this.adminService.addAdmin(name, email, password);
      res.status(201).json({ success: true, message: 'Admin added successfully' });
    } catch (error) {
      next(error);
    }
  };
}
