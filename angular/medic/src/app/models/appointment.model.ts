export interface Appointment {
  id: number;
  doctorName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'past';
}
