'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class interference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  interference.init({
    lessonOne: DataTypes.STRING,
    lessonTwo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'interference',
  });
  return interference;
};