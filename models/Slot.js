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
      models.Proffesor.hasMany(slot)
    }
  };
  slot.init({
    startTime: DataTypes.DATE,
    endTime: DataTypes.DATE,
    isOk: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    sequelize,
    modelName: 'slot',
  });
  return slot;
};