import { User } from '../models/mysql/User';
import bcrypt from 'bcrypt';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class AdminService {
  public async getAllUsers(role?: string): Promise<User[]> {
    const whereClause = role ? { role } : {};
    return User.findAll({ where: whereClause });
  }

  public async verifyDoctor(doctorId: number, status: string, comments?: string): Promise<void> {
    const doctor = await User.findByPk(doctorId);
    if (!doctor || doctor.role !== 'Doctor') {
      throw new NotFoundError('Doctor not found');
    }
    doctor.status = status;
    doctor.comments = comments || null;
    await doctor.save();
  }

  public async addAdmin(name: string, email: string, password: string): Promise<void> {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Email is already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Admin',
      status: 'Approved',
    });
  }
}
