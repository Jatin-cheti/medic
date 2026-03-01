import { DataTypes } from 'sequelize';

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.STRING(36),
      unique: true,
      allowNull: false,
    },
    patientId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'patient_id',
    },
    doctorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'doctor_profiles',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'doctor_id',
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'scheduled_at',
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      field: 'duration_minutes',
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
      defaultValue: 'pending',
    },
    consultationType: {
      type: DataTypes.ENUM('video', 'chat', 'audio'),
      defaultValue: 'video',
      field: 'consultation_type',
    },
    reason: DataTypes.TEXT,
    symptoms: DataTypes.TEXT,
    medicalHistory: {
      type: DataTypes.TEXT,
      field: 'medical_history',
    },
    appointmentFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'appointment_fee',
    },
    notes: DataTypes.TEXT,
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'confirmed_at',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at',
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ended_at',
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cancellation_reason',
    },
    meetingLink: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'meeting_link',
    },
  }, {
    tableName: 'appointments',
    timestamps: true,
    underscored: true,
  });

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, { foreignKey: 'patientId', as: 'patient' });
    Appointment.belongsTo(models.DoctorProfile, { foreignKey: 'doctorId', as: 'doctor' });
    Appointment.hasOne(models.Payment, { foreignKey: 'appointmentId', as: 'payment' });
    Appointment.hasOne(models.Prescription, { foreignKey: 'appointmentId', as: 'prescription' });
    Appointment.hasOne(models.Review, { foreignKey: 'appointmentId', as: 'review' });
  };

  return Appointment;
};
