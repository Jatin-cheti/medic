import mongoose from 'mongoose';

const symptomCheckSchema = new mongoose.Schema({
    symptoms: {
        type: [String],
        required: true,
    },
    recommendations: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const SymptomCheck = mongoose.model('SymptomCheck', symptomCheckSchema);
