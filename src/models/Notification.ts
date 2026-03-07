import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
    doctorId: { type: Schema.Types.ObjectId, required: true, ref: 'Doctor' },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Notification = model('Notification', notificationSchema);

export default Notification;
