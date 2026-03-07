import request from 'supertest';
import app from '../../src/app'; // Assuming your Express app is exported from this file
import { connectDB, disconnectDB } from '../../src/config/db'; // Database connection functions
import SymptomCheckerService from '../../src/services/symptomChecker.service'; // Service to handle symptom checking

jest.mock('../../src/services/symptomChecker.service'); // Mock the service

describe('Symptom Checker API', () => {
  beforeAll(async () => {
    await connectDB(); // Connect to the database before tests
  });

  afterAll(async () => {
    await disconnectDB(); // Disconnect from the database after tests
  });

  describe('POST /symptom-checker', () => {
    it('should return diagnosis and recommendations for valid symptoms', async () => {
      const symptoms = ['fever', 'cough'];
      const mockResponse = {
        diagnosis: 'Flu',
        recommendations: ['Rest', 'Hydration', 'Consult a doctor if symptoms persist'],
      };

      (SymptomCheckerService.checkSymptoms as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/symptom-checker')
        .send({ symptoms })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(SymptomCheckerService.checkSymptoms).toHaveBeenCalledWith(symptoms);
    });

    it('should return 400 for invalid symptoms input', async () => {
      const response = await request(app)
        .post('/symptom-checker')
        .send({ symptoms: '' }) // Invalid input
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Symptoms are required');
    });

    it('should handle service errors gracefully', async () => {
      const symptoms = ['fever'];
      (SymptomCheckerService.checkSymptoms as jest.Mock).mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/symptom-checker')
        .send({ symptoms })
        .set('Accept', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');
    });
  });
});
