export interface Appointment {
  id: string;
  user_id: string;
  doctor_id: string;
  appointment_date: Date;
  appointment_type: 'video' | 'audio' | 'physical';
  status: 'upcoming' | 'completed' | 'canceled';
  created_at: Date;
  updated_at: Date;
}
