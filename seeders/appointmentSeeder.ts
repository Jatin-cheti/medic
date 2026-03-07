import db from '../config/database';

const seedAppointments = async () => {
  const appointments = [
    { user_id: '1', doctor_id: '2', appointment_date: new Date(), appointment_type: 'video', status: 'upcoming' },
    { user_id: '1', doctor_id: '3', appointment_date: new Date(), appointment_type: 'physical', status: 'completed' },
  ];

  for (const appointment of appointments) {
    await db.execute('INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_type, status) VALUES (?, ?, ?, ?, ?)', 
      [appointment.user_id, appointment.doctor_id, appointment.appointment_date, appointment.appointment_type, appointment.status]);
  }
};

seedAppointments().catch(console.error);
