import { DataTypes } from 'sequelize';

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
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
    roleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      field: 'role_id',
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'password_hash',
    },
    firstName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'first_name',
    },
    lastName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'last_name',
    },
    avatarUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'avatar_url',
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'date_of_birth',
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    isSuspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_suspended',
    },
    suspensionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'suspension_reason',
    },
    preferredLanguage: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
      field: 'preferred_language',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login',
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    User.hasOne(models.DoctorProfile, { foreignKey: 'userId', as: 'doctorProfile' });
    User.hasMany(models.Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
    User.hasMany(models.Conversation, { foreignKey: 'patientId', as: 'patientConversations' });
    User.hasMany(models.AdminLog, { foreignKey: 'adminId', as: 'adminActions' });
  };

  return User;
};
