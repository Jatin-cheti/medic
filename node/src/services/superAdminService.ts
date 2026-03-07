import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class SuperAdminService {
  static async addAdmin({ name, email, password }: { name: string; email: string; password: string }) {
    const existingAdmin = await User.findOne({ where: { email, role: 'Admin' } });
    if (existingAdmin) {
      throw new BadRequestError('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Admin',
      status: 'Approved',
    });

    return newAdmin;
  }

  static async removeAdmin(id: number) {
    const admin = await User.findOne({ where: { id, role: 'Admin' } });
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    await admin.destroy();
  }
}
