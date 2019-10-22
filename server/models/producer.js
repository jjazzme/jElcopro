'use strict';

module.exports = (sequelize, DataTypes) => {
  var producer = sequelize.define('Producer', {
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
  }, {
    freezeTableName: true,
    tableName: 'producers'
  });
  producer.associate = function(models) {
    producer.belongsTo(models.Producer, {
      foreignKey: 'right_producer_id',
      sourceKey: 'id',
      constraints: false,
      as: 'rightProducer'
    });
  };
  return producer;
};