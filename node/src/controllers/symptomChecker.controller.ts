import { Request, Response, NextFunction } from 'express';
import { SymptomCheckerService } from '../services/symptomChecker.service';

export class SymptomCheckerController {
  private symptomCheckerService: SymptomCheckerService;

  constructor() {
    this.symptomCheckerService = new SymptomCheckerService();
  }

  async checkSymptoms(req: Request, res: Response, next: NextFunction) {
    try {
      const { symptoms } = req.body;
      const userId = req.user.id; // Extracted from JWT payload

      const result = await this.symptomCheckerService.getDiagnosis(symptoms, userId);

      res.status(200).json({
        message: 'Diagnosis and recommendations retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
