/**
 * Schema for User
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('User',
    {
      id: {type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true},
      employeeId: {type: DataTypes.STRING(2048), allowNull: true, unique: false},
      firstName: {type: DataTypes.STRING(2048), allowNull: true},
      lastName: {type: DataTypes.STRING(2048), allowNull: true},
      email: {type: DataTypes.STRING(2048), allowNull: false, unique: true},
      role: {type: DataTypes.STRING(64), allowNull: false},
      status: {type: DataTypes.STRING(64), allowNull: false},
      accessToken: {type: DataTypes.STRING(1024)},
      accessTokenValidUntil: {type: DataTypes.DATE}
    },
    {
      timestamps: true,
      createdAt: 'createdOn',
      updatedAt: 'updatedOn'
    }
  )
