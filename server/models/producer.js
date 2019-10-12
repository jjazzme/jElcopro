'use strict';
module.exports = (sequelize, DataTypes) => {
  const Producer = sequelize.define('Producer', {
    name: DataTypes.STRING,
    site: DataTypes.STRING,
    right_producer_id: {
      type:DataTypes.INTEGER,
      references: {
        model: 'Producer',
        key: 'id',
        allowNull: true,
      }
    },
    picture: DataTypes.STRING
  }, {});
  Producer.associate = function(models) {
    Producer.belongsTo(models.Product);
  };
  return Producer;
};