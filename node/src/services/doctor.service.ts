import { DoctorRepository } from '../repositories/doctor.repository';
import { BadRequestError } from '../errors/BadRequestError';

export class DoctorService {
  private doctorRepository: DoctorRepository;

  constructor() {
    this.doctorRepository = new DoctorRepository();
  }

  public async setConsultationRate(doctorId: number, rate: number): Promise<void> {
    if (rate <= 0) {
      throw new BadRequestError('Consultation rate must be greater than zero.');
    }

    await this.doctorRepository.updateConsultationRate(doctorId, rate);
  }
}
