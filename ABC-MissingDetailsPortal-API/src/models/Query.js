/**
 * Schema for Query
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('Query',
    {
      id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
      exceptionSubType: { type: DataTypes.STRING(2048) },
      accountName: { type: DataTypes.STRING(2048), allowNull: false },
      ampId: { type: DataTypes.STRING(2048), allowNull: false },
      billingIndex: { type: DataTypes.STRING(2048), allowNull: false },
      billingStartDate: { type: DataTypes.DATE, allowNull: false },
      billingEndDate: { type: DataTypes.DATE, allowNull: false },
      sapContract: { type: DataTypes.STRING(2048), allowNull: false },
      valueToBeBilled: { type: DataTypes.DECIMAL, allowNull: false },
      dueDate: { type: DataTypes.DATE, allowNull: false },
      reviseDate: { type: DataTypes.DATE },
      openedDate: { type: DataTypes.DATE, allowNull: false },
      closedDate: { type: DataTypes.DATE },
      rework: { type: DataTypes.BOOLEAN, allowNull: false },
      reworkReason: { type: DataTypes.STRING(2048) },
      dmpsPmps: { type: DataTypes.STRING(2048), allowNull: false },
      status: { type: DataTypes.STRING(64), allowNull: false },
      comment: { type: DataTypes.TEXT },
      priority: { type: DataTypes.STRING(64), allowNull: false }
    },
    {
      timestamps: true,
      createdAt: false,
      updatedAt: 'updatedOn'
    }
  )
