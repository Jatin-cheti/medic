'use strict';

module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    device_uuid: { type: DataTypes.STRING(128), allowNull: false },
    push_token: { type: DataTypes.STRING(1024), allowNull: true },
    last_seen_at: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
  }, {
    tableName: 'devices',
    timestamps: false,
    underscored: true
  });

  Device.associate = function(models) {
    Device.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Device;
};