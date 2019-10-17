'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      party_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fact_address_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      own: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      picture: {
        type: Sequelize.STRING,
        allowNull: true
      },
      with_vat: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
          'Companies',
          ['party_id'],
          {type: 'unique', name: 'party_id_uk'}
          )
    }).then(() => {
      queryInterface.addConstraint(
          'Companies',
          ['party_id'],
          {
            type: 'foreign key',
            name: 'fk_companies_party',
            references: {
              table: 'Parties',
              field: 'id'
            },
            onDelete: 'restrict',
            onUpdate: 'restrict'
          }
      )
    }).then(() => {
      queryInterface.addConstraint(
          'Companies',
          ['fact_address_id'],
          {
            type: 'foreign key',
            name: 'fk_companies_address',
            references: {
              table: 'Addresses',
              field: 'id'
            },
            onDelete: 'restrict',
            onUpdate: 'restrict'
          }
      )
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Companies');
  }
};