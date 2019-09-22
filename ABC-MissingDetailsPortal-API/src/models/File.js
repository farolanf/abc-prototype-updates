/**
 * Schema for File
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('File',
    {
      id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(256), allowNull: false },
      mimeType: { type: DataTypes.STRING(128) },
      fileURL: { type: DataTypes.STRING(1024), allowNull: false },
      // file name stored in local storage at public/upload folder
      filename: { type: DataTypes.STRING(256) },
      createdBy: { type: DataTypes.BIGINT }
    },
    {
      timestamps: true,
      createdAt: 'createdOn',
      updatedAt: false
    }
  )
