'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.addConstraint(
        'Addresses',
        ['address'],
        {type: 'unique', name: 'address_name_uk'}
    )
  },

  down: () => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
