import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/mysql';
import { User } from './User';

export class Appointment extends Model {
  public id!: number;
  public doctorId!: number;
  public patientId!: number;
  public type!: 'Video' | 'Audio' | 'Physical';
  public date!: string;
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

// Associations
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
Appointment.belongsTo(User, { as: 'patient', foreignKey: 'patientId' });
