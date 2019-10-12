'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint('tableShells', ['user_id', 'table'], {
        type: 'unique',
        name: 'cu_user_table'
      }),
      queryInterface.addConstraint('parameters', ['key'], {
        type: 'unique',
        name: 'cu_key'
      }),
      queryInterface.addConstraint('products', ['category_id'], {
        type: 'foreign key',
        name: 'fk_product_category',
        references: {
          table: 'categories',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
      queryInterface.addConstraint('products', ['producer_id'], {
        type: 'foreign key',
        name: 'fk_product_producer',
        references: {
          table: 'producers',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
      queryInterface.addConstraint('products', ['right_product_id'], {
        type: 'foreign key',
        name: 'fk_product_product',
        references: {
          table: 'products',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    ])

  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint('tableShells', 'cu_user_table'),
      queryInterface.removeConstraint('parameters', 'cu_key'),
      queryInterface.removeConstraint('products', 'fk_product_category'),
      queryInterface.removeConstraint('products', 'fk_product_producer'),
      queryInterface.removeConstraint('products', 'fk_product_product'),
    ])
  }
};
