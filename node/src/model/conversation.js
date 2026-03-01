'use strict';

module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.STRING(36), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: true },
    type: { type: DataTypes.ENUM('direct', 'group', 'channel'), allowNull: false, defaultValue: 'direct' },
    is_archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    metadata: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
  }, {
    tableName: 'conversations',
    timestamps: false,
    underscored: true
  });

  Conversation.associate = function(models) {
    Conversation.hasMany(models.ConversationParticipant, { foreignKey: 'conversation_id' });
    Conversation.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Conversation.hasMany(models.CallSession, { foreignKey: 'conversation_id' });
  };

  return Conversation;
};