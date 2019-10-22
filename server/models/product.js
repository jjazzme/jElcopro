'use strict';

module.exports = (sequelize, DataTypes) => {
  var Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    search_name: DataTypes.STRING,
    vat: { type: DataTypes.DECIMAL, defaultValue: 20.00 },
    category_id: {
      type: DataTypes.INTEGER,
        /*
      references: {
        model: 'Category',
        key: 'id',
        allowNull: true,
      }

         */
    },
    producer_id: {
      type: DataTypes.INTEGER,
        /*
      references: {
        model: 'Producer',
        key: 'id',
        allowNull: true,
      }

         */
    },
    remark: DataTypes.TEXT,
    picture: DataTypes.STRING,
    right_product_id: {
      type: DataTypes.INTEGER,
        /*
      references:{
        model: 'Product',
        key: 'id',
        allowNull: true,
      }

         */
    },
  }, {});
  Product.associate = function(models) {
    Product.belongsTo(models.Category, { foreignKey: 'category_id' });
    Product.belongsTo(models.Producer, { foreignKey: 'producer_id' });
    Product.hasMany(models.Picture, {
      foreignKey: 'model_id',
      constraints: false,
      scope: {
        model_type: 'Product'
      }
    });
  };
  return Product;
};