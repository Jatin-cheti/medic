import { Request, Response, NextFunction } from 'express';
import { DoctorDashboardService } from '../services/doctorDashboardService';
import { validationResult } from 'express-validator';

export class DoctorDashboardController {
  private doctorDashboardService: DoctorDashboardService;

  constructor() {
    this.doctorDashboardService = new DoctorDashboardService();
  }

  public async getSymptomCheckerLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorId = req.user.id; // Assuming user ID is attached to the request after JWT verification
      const logs = await this.doctorDashboardService.getSymptomCheckerLogs(doctorId);
      res.status(200).json({ logs });
    } catch (error) {
      next(error);
    }
  }

  public async querySymptomChecker(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const doctorId = req.user.id; // Assuming user ID is attached to the request after JWT verification
      const { symptoms } = req.body;
      const result = await this.doctorDashboardService.querySymptomChecker(doctorId, symptoms);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
