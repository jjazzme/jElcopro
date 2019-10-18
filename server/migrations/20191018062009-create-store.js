'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Stores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      company_id: {
        type: Sequelize.INTEGER
      },
      address_id: {
        type: Sequelize.INTEGER
      },
      online: {
        type: Sequelize.BOOLEAN
      },
      is_main: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => {
      queryInterface.addConstraint(
          'Stores',
          ['company_id', 'is_main'],
          {type: 'unique', name: 'stores_is_main_uk'}
      )
    }).then(() => {
      queryInterface.addConstraint(
          'Stores',
          ['address_id'],
          {
            type: 'foreign key',
            name: 'fk_stores_address',
            references: {
              table: 'Addresses',
              field: 'id'
            },
            onDelete: 'restrict',
            onUpdate: 'restrict'
          }
      )
    }).then(() => {
      queryInterface.addConstraint(
          'Stores',
          ['company_id'],
          {
            type: 'foreign key',
            name: 'fk_stores_company',
            references: {
              table: 'Companies',
              field: 'id'
            },
            onDelete: 'restrict',
            onUpdate: 'restrict'
          }
      )
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Stores');
  }
};