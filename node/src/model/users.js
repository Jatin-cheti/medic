'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.STRING(36), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    phone: { type: DataTypes.STRING(32), allowNull: true, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: true },
    password: { type: DataTypes.STRING(255), allowNull: true },
    username: { type: DataTypes.STRING(128), allowNull: true, unique: true },
    display_name: { type: DataTypes.STRING(128), allowNull: true },
    avatar_url: { type: DataTypes.STRING(1024), allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
  }, {
    tableName: 'users',
    timestamps: false,
    underscored: true
  });

  User.associate = function(models) {
    User.hasMany(models.ConversationParticipant, { foreignKey: 'user_id' });
    User.hasMany(models.Contact, { foreignKey: 'user_id' });
    User.hasMany(models.Contact, { foreignKey: 'contact_user_id', as: 'contactOf' });
    User.hasMany(models.Device, { foreignKey: 'user_id' });
    User.hasMany(models.CallParticipant, { foreignKey: 'user_id' });
    User.hasMany(models.Conversation, { foreignKey: 'created_by', as: 'createdConversations' });
  };

  return User;
};