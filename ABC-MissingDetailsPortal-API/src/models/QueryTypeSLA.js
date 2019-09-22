/**
 * Schema for QueryTypeSLA
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('QueryTypeSLA',
    {
      id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
      number: { type: DataTypes.INTEGER, allowNull: false },
      units: { type: DataTypes.STRING(64), allowNull: false },
      exceptionTypeId: { type: DataTypes.BIGINT, allowNull: false, unique: true }
    },
    {
      timestamps: false
    }
  )
