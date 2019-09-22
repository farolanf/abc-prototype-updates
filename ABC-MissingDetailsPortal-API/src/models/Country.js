/**
 * Schema for Country
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('Country',
    {
      id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(256), allowNull: false }
    },
    {
      timestamps: false
    }
  )
