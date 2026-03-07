import bcrypt from 'bcrypt';
import Admin from '../models/Admin';

export const createAdmin = async (adminData: any) => {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const admin = new Admin({ ...adminData, password: hashedPassword });
    return await admin.save();
};

export const getAdmins = async () => {
    return await Admin.find();
};

export const deleteAdmin = async (id: string) => {
    await Admin.findByIdAndDelete(id);
};
