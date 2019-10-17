'use strict';
module.exports = (sequelize, DataTypes) => {
  const Picture = sequelize.define('Picture', {
    name: DataTypes.STRING,
    model_id: DataTypes.INTEGER,
    model_type: DataTypes.STRING
  }, {});
  Picture.associate = function(models) {
    Picture.belongsTo(models.Product, {
      foreignKey: 'model_id',
      constraints: false,
      as: 'picture'
    });
  };
  return Picture;
};