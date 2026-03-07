import axios from 'axios';
import { SymptomCheckerLogModel } from '../models/symptomCheckerLog.model';

export class SymptomCheckerService {
  private AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/completions';
  private AI_API_KEY = process.env.AI_API_KEY || '';

  async getDiagnosis(symptoms: string[], userId: number) {
    try {
      // Call external AI service
      const response = await axios.post(
        this.AI_API_URL,
        {
          prompt: `Diagnose the following symptoms: ${symptoms.join(', ')}`,
          max_tokens: 100,
          model: 'text-davinci-003',
        },
        {
          headers: {
            Authorization: `Bearer ${this.AI_API_KEY}`,
          },
        }
      );

      const diagnosis = response.data.choices[0].text.trim();
      const recommendations = this.extractRecommendations(diagnosis);

      // Save log to MongoDB
      const log = new SymptomCheckerLogModel({
        userId,
        symptoms,
        diagnosis,
        recommendations,
        createdAt: new Date(),
      });
      await log.save();

      return { diagnosis, recommendations };
    } catch (error) {
      throw new Error('Failed to get diagnosis from AI service.');
    }
  }

  private extractRecommendations(diagnosis: string): string[] {
    // Extract recommendations from the AI response (example logic)
    return diagnosis.split('.').filter((sentence) => sentence.includes('recommend'));
  }
}
