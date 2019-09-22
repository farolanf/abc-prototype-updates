/**
 * Schema for SDMComment
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('SDMComment',
    {
      id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
      text: { type: DataTypes.STRING(2056), allowNull: false },
      rejectReason: { type: DataTypes.STRING(2056), allowNull: true },
      status: { type: DataTypes.STRING(64), allowNull: false }
    },
    {
      timestamps: true,
      createdAt: 'createdOn',
      updatedAt: false
    }
  )
