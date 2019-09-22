/**
 * Schema for DeliveryAndManagementUserEmailSettings
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('DeliveryAndManagementUserEmailSettings',
    {
      id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
      emailsFrequency: { type: DataTypes.STRING(64), allowNull: false },
      newQueries: { type: DataTypes.BOOLEAN, allowNull: false },
      openQueries: { type: DataTypes.BOOLEAN, allowNull: false },
      closedQueries: { type: DataTypes.BOOLEAN, allowNull: false }
    },
    {
      timestamps: false
    }
  )
