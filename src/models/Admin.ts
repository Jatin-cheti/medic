import { Schema, model, Document } from 'mongoose';

interface IAdmin extends Document {
    username: string;
    password: string;
    email: string;
    role: string;
}

const AdminSchema = new Schema<IAdmin>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'admin' },
});

const Admin = model<IAdmin>('Admin', AdminSchema);
export default Admin;
