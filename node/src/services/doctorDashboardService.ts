import { SymptomCheckerLog } from '../models/mongo/symptomCheckerLog';
import { ExternalSymptomCheckerAPI } from '../utils/externalSymptomCheckerAPI';

export class DoctorDashboardService {
  public async getSymptomCheckerLogs(doctorId: string): Promise<any> {
    try {
      const logs = await SymptomCheckerLog.find({ userId: doctorId });
      return logs;
    } catch (error) {
      throw new Error('Error fetching symptom checker logs');
    }
  }

  public async querySymptomChecker(doctorId: string, symptoms: string[]): Promise<any> {
    try {
      const diagnosisResult = await ExternalSymptomCheckerAPI.query(symptoms);

      // Save the query and result to MongoDB
      const log = new SymptomCheckerLog({
        userId: doctorId,
        symptoms,
        diagnosis: diagnosisResult.diagnosis,
        recommendations: diagnosisResult.recommendations,
        createdAt: new Date(),
      });
      await log.save();

      return diagnosisResult;
    } catch (error) {
      throw new Error('Error querying symptom checker');
    }
  }
}
