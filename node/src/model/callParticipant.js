'use strict';

module.exports = (sequelize, DataTypes) => {
  const CallParticipant = sequelize.define('CallParticipant', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    call_session_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    joined_at: { type: DataTypes.DATE, allowNull: true },
    left_at: { type: DataTypes.DATE, allowNull: true },
    state: { type: DataTypes.ENUM('joining', 'connected', 'left'), allowNull: false, defaultValue: 'joining' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
  }, {
    tableName: 'call_participants',
    timestamps: false,
    underscored: true
  });

  CallParticipant.associate = function(models) {
    CallParticipant.belongsTo(models.CallSession, { foreignKey: 'call_session_id' });
    CallParticipant.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return CallParticipant;
};