import { User } from '../models/user.model';
import { hashPassword } from '../utils/bcrypt.util';
import { AppError } from '../middlewares/error.middleware';

export class AdminService {
  public async addAdmin(name: string, email: string, password: string): Promise<User> {
    const hashedPassword = await hashPassword(password);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email is already in use', 400);
    }

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Admin',
      status: 'Approved',
    });

    return admin;
  }

  public async removeAdmin(adminId: number): Promise<void> {
    const admin = await User.findByPk(adminId);

    if (!admin || admin.role !== 'Admin') {
      throw new AppError('Admin not found', 404);
    }

    await admin.destroy();
  }
}
