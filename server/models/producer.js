'use strict';
module.exports = (sequelize, DataTypes) => {
  var Producer = sequelize.define('Producer', {
    name: DataTypes.STRING,
    site: DataTypes.STRING,
    right_producer_id: {
      type:DataTypes.INTEGER,
      /*
      references: {
        model: 'Producer',
        key: 'id',
        allowNull: true,
      }

       */
    },
    picture: DataTypes.STRING
  }, {});
  Producer.associate = function(models) {
    /*
    Producer.hasOne(models.Producer, {
      foreignKey: 'right_producer',
      as: 'rightproducer'
    });

     */
  };
  return Producer;
};