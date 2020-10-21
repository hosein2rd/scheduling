'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class proffesorLesson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      proffesorLesson.belongsTo(models.Proffesor)
      proffesorLesson.belongsTo(models.Lesson)
      models.Proffesor.hasMany(proffesorLesson)
      models.Lesson.hasMany(proffesorLesson)
      models.Proffesor.belongsToMany(models.Lesson, { through: proffesorLesson })
      models.Lesson.belongsToMany(models.Proffesor, { through: proffesorLesson })
    }
  };
  proffesorLesson.init({}, {
    sequelize,
    modelName: 'proffesorLesson',
  });
  return proffesorLesson;
};