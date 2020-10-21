'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class classEntity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      classEntity.belongsTo(models.Lesson)
      models.Lesson.hasOne(classEntity)
    }
  };
  classEntity.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'class',
  });
  return classEntity;
};