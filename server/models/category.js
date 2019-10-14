'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: DataTypes.STRING,
    lft: DataTypes.INTEGER,
    rgt: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
    picture: DataTypes.STRING
  }, {});
  Category.associate = function(models) {
    //Category.hasMany(models.Product, {as: 'item'});
  };
  return Category;
};