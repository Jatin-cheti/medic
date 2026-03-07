import User from '../models/user.model';
import { hashPassword } from '../utils/bcrypt.util';

class SuperAdminService {
  async addAdmin(name: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password);

    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Admin',
      status: 'Approved',
    });

    return newAdmin;
  }

  async removeAdmin(adminId: number) {
    const admin = await User.findByPk(adminId);

    if (!admin || admin.role !== 'Admin') {
      throw new Error('Admin not found');
    }

    await admin.destroy();
    return { message: 'Admin removed successfully' };
  }
}

export default new SuperAdminService();
