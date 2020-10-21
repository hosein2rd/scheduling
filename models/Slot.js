'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class slot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      slot.belongsTo(models.Proffesor)
      models.Proffesor.hasOne(slot)
    }
  };
  slot.init({
    saturday: DataTypes.BOOLEAN,
    sunday: DataTypes.BOOLEAN,
    monday: DataTypes.BOOLEAN,
    tuesday: DataTypes.BOOLEAN,
    wendsday: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'slot',
  });
  return slot;
};