import { sequelize } from '../config/database';
import { QueryTypes } from 'sequelize';

export class DoctorRepository {
  public async updateConsultationRate(doctorId: number, rate: number): Promise<void> {
    const query = `
      UPDATE Users
      SET consultationRate = :rate
      WHERE id = :doctorId AND role = 'Doctor'
    `;

    await sequelize.query(query, {
      replacements: { doctorId, rate },
      type: QueryTypes.UPDATE,
    });
  }
}
