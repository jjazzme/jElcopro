'use strict';
module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define('Company', {
    party_id: DataTypes.INTEGER,
    fact_address_id: DataTypes.INTEGER,
    own: DataTypes.BOOLEAN,
    phone: DataTypes.STRING,
    picture: DataTypes.STRING,
    with_vat: DataTypes.BOOLEAN
  }, {});
  Company.associate = function(models) {
    // associations can be defined here
  };
  return Company;
};