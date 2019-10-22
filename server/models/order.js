'use strict';

module.exports = (sequelize, DataTypes) => {
    var Order = sequelize.define('Order', {
        date: DataTypes.DATE,
        number: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        document_type_id: DataTypes.STRING,
        parent_id: DataTypes.INTEGER,
        sellerable_id: DataTypes.INTEGER,
        sellerable_type: {
            type: DataTypes.STRING,
            defaultValue: 'Company',
            allowNull: false
        },
        buyerable_id: DataTypes.INTEGER,
        buyerable_type: {
            type: DataTypes.STRING,
            defaultValue: 'Company',
            allowNull: false
        },
        store_id: DataTypes.INTEGER,
        foreign_store_id: DataTypes.INTEGER,
        closed: DataTypes.BOOLEAN,
        currency_id: DataTypes.STRING,
        number_prefix: DataTypes.STRING,
        status_id: DataTypes.STRING,
    }, {
        freezeTableName: true,
        tableName: 'documents',
        defaultScope: {where: {document_type_id: 'order'}},
    });
    Order.prototype.getParentAlias = function(){
        return `${this.Parent.documentType.name} №${this.Parent.number}`
    };
    Order.associate = function(models) {
        Order.belongsTo(models.documentType, {foreignKey:'document_type_id'});
        Order.belongsTo(models.Document, {
            foreignKey: 'parent_id',
            as: 'Parent'
        });
        Order.belongsTo(models.Store, {foreignKey:'foreign_store_id'});

        Order.belongsTo(models.User, {foreignKey: 'user_id'});
        Order.belongsTo(models.Store, {foreignKey:'store_id'});
        Order.belongsTo(models.Currency, {foreignKey: 'currency_id'});
        Order.belongsTo(models.Company, {
            foreignKey: 'sellerable_id',
            constraints: false,
            as: 'Sellerable'
        });
        Order.belongsTo(models.Company, {
            foreignKey: 'buyerable_id',
            constraints: false,
            as: 'Buyerable'
        });
    };
    return Order;
};