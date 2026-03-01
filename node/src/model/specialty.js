import { DataTypes } from 'sequelize';

module.exports = (sequelize) => {
  const Specialty = sequelize.define('Specialty', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    iconUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'icon_url',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'specialties',
    timestamps: true,
    underscored: true,
  });

  return Specialty;
};
