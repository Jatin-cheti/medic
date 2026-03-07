import { Request, Response } from 'express';
import { SymptomCheckerService } from '../services/symptomCheckerService';
import { validateSymptomInput } from '../middlewares/validationMiddleware';

export class SymptomCheckerController {
    private symptomCheckerService: SymptomCheckerService;

    constructor() {
        this.symptomCheckerService = new SymptomCheckerService();
    }

    public async checkSymptoms(req: Request, res: Response) {
        const { symptoms } = req.body;

        try {
            const result = await this.symptomCheckerService.analyzeSymptoms(symptoms);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}
