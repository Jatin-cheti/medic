'use strict';

module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    contact_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    display_name: { type: DataTypes.STRING(128), allowNull: true },
    is_blocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
  }, {
    tableName: 'contacts',
    timestamps: false,
    underscored: true
  });

  Contact.associate = function(models) {
    Contact.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner' });
    Contact.belongsTo(models.User, { foreignKey: 'contact_user_id', as: 'contactUser' });
  };

  return Contact;
};