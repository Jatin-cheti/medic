import { DataTypes } from 'sequelize';

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
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
      type: DataTypes.ENUM('patient', 'doctor', 'admin'),
      allowNull: false,
      unique: true,
    },
    description: DataTypes.TEXT,
  }, {
    tableName: 'roles',
    timestamps: true,
  });

  return Role;
};
