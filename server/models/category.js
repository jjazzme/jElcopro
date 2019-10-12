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
    // associations can be defined here
  };
  return Category;
};