'use strict';

module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define('Category', {
    name: DataTypes.STRING,
    lft: DataTypes.INTEGER,
    rgt: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
    picture: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'categories'
  });
  category.associate = function(models) {
    //Category.hasMany(models.Product, {as: 'item'});
  };
  return category;
};