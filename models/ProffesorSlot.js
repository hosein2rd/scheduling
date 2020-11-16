'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class proffesorSlot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      proffesorSlot.belongsTo(models.Proffesor)
      proffesorSlot.belongsTo(models.Slot)
      models.Proffesor.hasMany(proffesorSlot)
      models.Slot.hasMany(proffesorSlot)
      models.Proffesor.belongsToMany(models.Slot, { through: proffesorSlot })
      models.Slot.belongsToMany(models.Proffesor, { through: proffesorSlot })
    }
  };
  proffesorSlot.init({}, {
    sequelize,
    modelName: 'proffesorSlot',
  });
  return proffesorSlot;
};