import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

interface AppointmentAttributes {
  id: number;
  doctorId: number;
  patientId: number;
  type: 'Video' | 'Audio' | 'Physical';
  date: Date;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'id'> {}

export class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public id!: number;
  public doctorId!: number;
  public patientId!: number;
  public type!: 'Video' | 'Audio' | 'Physical';
  public date!: Date;
  public time!: string;
  public status!: 'Scheduled' | 'Completed' | 'Cancelled';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    doctorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    patientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('Video', 'Audio', 'Physical'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
  }
);

Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
