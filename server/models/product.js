'use strict';

module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define('Product', {
    name: DataTypes.STRING,
    search_name: DataTypes.STRING,
    vat: { type: DataTypes.DECIMAL, defaultValue: 20.00 },
    category_id: {
      type: DataTypes.INTEGER,
    },
    producer_id: {
      type: DataTypes.INTEGER,
    },
    remark: DataTypes.TEXT,
    picture: DataTypes.STRING,
    right_product_id: {
      type: DataTypes.INTEGER,
    },
  }, {
    freezeTableName: true,
    tableName: 'products'
  });
  product.associate = function(models) {
    product.belongsTo(models.Category,  { as: 'category', foreignKey: 'category_id' });
    product.belongsTo(models.Producer, { as: 'producer', foreignKey: 'producer_id' });
    product.hasMany(models.Parameter, { as: 'parameters', foreignKey: 'product_id' });
    product.hasMany(models.Picture, {
      foreignKey: 'model_id',
      constraints: false,
      scope: {
        model_type: 'Product'
      },
      as: 'pictures'
    });
  };
  return product;
};