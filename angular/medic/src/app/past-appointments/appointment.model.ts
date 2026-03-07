export interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  type: string; // e.g., Video, Audio, Physical
  billAmount: number;
  prescription?: { url: string }; // Optional prescription object
}
