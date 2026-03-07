import axios from 'axios';

export class ExternalSymptomCheckerAPI {
  private static API_URL = process.env.SYMPTOM_CHECKER_API_URL || 'https://api.example.com/symptom-checker';
  private static API_KEY = process.env.SYMPTOM_CHECKER_API_KEY || 'your-api-key';

  public static async query(symptoms: string[]): Promise<any> {
    try {
      const response = await axios.post(
        this.API_URL,
        { symptoms },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.API_KEY}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error('Error communicating with the external symptom checker API');
    }
  }
}
