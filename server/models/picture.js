'use strict';

module.exports = (sequelize, DataTypes) => {
  const picture = sequelize.define('Picture', {
    name: DataTypes.STRING,
    model_id: DataTypes.INTEGER,
    model_type: DataTypes.STRING
  }, {
      freezeTableName: true,
      tableName: 'pictures'
  });
  picture.associate = function(models) {
    picture.belongsTo(models.Product, {
      foreignKey: 'model_id',
      constraints: false
    });
  };
  return picture;
};