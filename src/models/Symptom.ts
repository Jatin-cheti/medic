import { db } from '../config/database';

export class Symptom {
    public static async create(symptom: string, doctorId: number) {
        await db.execute('INSERT INTO symptoms (symptom, doctor_id) VALUES (?, ?)', [symptom, doctorId]);
    }
}
