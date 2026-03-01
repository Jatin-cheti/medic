import { DataTypes } from 'sequelize';

module.exports = (sequelize) => {
  const DoctorProfile = sequelize.define('DoctorProfile', {
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
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'user_id',
    },
    registrationNumber: {
      type: DataTypes.STRING(128),
      unique: true,
      allowNull: false,
      field: 'registration_number',
    },
    bio: DataTypes.TEXT,
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'years_of_experience',
    },
    clinicAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'clinic_address',
    },
    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'consultation_fee',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified',
    },
    verificationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'verification_date',
    },
    verifiedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      field: 'verified_by',
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_approved',
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approval_date',
    },
    isSuspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_suspended',
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    totalConsultations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_consultations',
    },
  }, {
    tableName: 'doctor_profiles',
    timestamps: true,
    underscored: true,
  });

  DoctorProfile.associate = (models) => {
    DoctorProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    DoctorProfile.hasMany(models.Appointment, { foreignKey: 'doctorId', as: 'appointments' });
    DoctorProfile.belongsToMany(models.Specialty, {
      through: 'doctor_specialties',
      as: 'specialties',
      foreignKey: 'doctorId',
    });
    DoctorProfile.belongsToMany(models.Language, {
      through: 'doctor_languages',
      as: 'languages',
      foreignKey: 'doctorId',
    });
  };

  return DoctorProfile;
};
