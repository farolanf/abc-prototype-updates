/**
 * Schema for Currency
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('Currency',
    {
      id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(256), allowNull: false },
      symbol: { type: DataTypes.STRING(3) }
    },
    {
      timestamps: false
    }
  )
