import User from '../models/User';

class AdminService {
  async verifyDoctor(doctorId: number, status: 'Approved' | 'Rejected', comments?: string): Promise<string> {
    const doctor = await User.findByPk(doctorId);
    if (!doctor || doctor.role !== 'Doctor') {
      throw new Error('Doctor not found');
    }

    doctor.status = status;
    await doctor.save();

    // Notify the doctor (e.g., via email or push notification)
    // Notification logic goes here...

    return `Doctor ${status.toLowerCase()} successfully.`;
  }
}

export const adminService = new AdminService();
