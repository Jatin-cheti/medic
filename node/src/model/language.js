import { DataTypes } from 'sequelize';

module.exports = (sequelize) => {
  const Language = sequelize.define('Language', {
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
    code: {
      type: DataTypes.STRING(10),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    nativeName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'native_name',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'languages',
    timestamps: true,
    underscored: true,
  });

  return Language;
};
