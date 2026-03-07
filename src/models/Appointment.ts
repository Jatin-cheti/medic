import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    patientId: string;

    @Column()
    doctorId: string;

    @Column()
    appointmentDate: Date;

    @Column()
    status: string;

    @Column()
    reminderSent: boolean;
}
