'use strict';

module.exports = (sequelize, DataTypes) => {
  const company = sequelize.define('Company', {
    party_id: DataTypes.INTEGER,
    fact_address_id: DataTypes.INTEGER,
    own: DataTypes.BOOLEAN,
    phone: DataTypes.STRING,
    picture: DataTypes.STRING,
    with_vat: DataTypes.BOOLEAN
  }, {
    freezeTableName: true,
    tableName: 'companies'
  });
  company.associate = function(models) {
    // associations can be defined here
    company.belongsTo(models.Party, {
      foreignKey: 'party_id'
    });
    company.belongsTo(models.Address, {
      foreignKey: 'fact_address_id',
      as: 'factAddress'
    });
    company.hasMany(models.Store, {
      foreignKey: 'company_id'
    })
  };
  return company;
};