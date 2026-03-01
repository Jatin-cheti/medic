'use strict';

module.exports = (sequelize, DataTypes) => {
  const ConversationParticipant = sequelize.define('ConversationParticipant', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    conversation_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    role: { type: DataTypes.ENUM('member', 'admin', 'owner'), allowNull: false, defaultValue: 'member' },
    muted_until: { type: DataTypes.DATE, allowNull: true },
    joined_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    last_read_message_uuid: { type: DataTypes.STRING(36), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
  }, {
    tableName: 'conversation_participants',
    timestamps: false,
    underscored: true
  });

  ConversationParticipant.associate = function(models) {
    ConversationParticipant.belongsTo(models.Conversation, { foreignKey: 'conversation_id' });
    ConversationParticipant.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return ConversationParticipant;
};