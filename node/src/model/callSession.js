'use strict';

module.exports = (sequelize, DataTypes) => {
  const CallSession = sequelize.define('CallSession', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.STRING(36), allowNull: false, unique: true },
    conversation_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    type: { type: DataTypes.ENUM('audio', 'video'), allowNull: false },
    state: { type: DataTypes.ENUM('ringing', 'in_progress', 'ended', 'missed'), allowNull: false, defaultValue: 'ringing' },
    started_at: { type: DataTypes.DATE, allowNull: true },
    ended_at: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
  }, {
    tableName: 'call_sessions',
    timestamps: false,
    underscored: true
  });

  CallSession.associate = function(models) {
    CallSession.belongsTo(models.Conversation, { foreignKey: 'conversation_id' });
    CallSession.hasMany(models.CallParticipant, { foreignKey: 'call_session_id' });
  };

  return CallSession;
};