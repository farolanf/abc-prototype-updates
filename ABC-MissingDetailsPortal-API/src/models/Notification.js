/**
 * Schema for Notification
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('Notification',
    {
      id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(256), allowNull: false },
      text: { type: DataTypes.STRING(256), allowNull: false },
      relatedModel: { type: DataTypes.STRING(64) },
      relatedModelId: { type: DataTypes.BIGINT },
      notificationType: { type: DataTypes.STRING(64), allowNull: false },
      status: { type: DataTypes.STRING(64), allowNull: false },
      readOn: { type: DataTypes.DATE }
    },
    {
      timestamps: true,
      createdAt: 'createdOn',
      updatedAt: false
    }
  )
