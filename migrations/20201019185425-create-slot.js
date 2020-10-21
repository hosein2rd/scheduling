'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('slots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      saturday: {
        type: Sequelize.BOOLEAN
      },
      sunday: {
        type: Sequelize.BOOLEAN
      },
      monday: {
        type: Sequelize.BOOLEAN
      },
      tuesday: {
        type: Sequelize.BOOLEAN
      },
      wendsday: {
        type: Sequelize.BOOLEAN
      },
      proffesorId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        references: {
          model: 'proffesors',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('slots');
  }
};