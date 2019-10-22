'use strict';

module.exports = (sequelize, DataTypes) => {
    const order = sequelize.define('Order', {
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
    order.prototype.getParentAlias = function(){
        return `${this.Parent.DocumentType.name} №${this.Parent.number}`
    };
    order.associate = function(models) {
        order.belongsTo(models.DocumentType, {foreignKey:'document_type_id'});
        order.belongsTo(models.Document, {
            foreignKey: 'parent_id',
            as: 'parent'
        });
        order.belongsTo(models.Store, {foreignKey:'foreign_store_id'});

        order.belongsTo(models.User, {foreignKey: 'user_id'});
        order.belongsTo(models.Store, {foreignKey:'store_id'});
        order.belongsTo(models.Currency, {foreignKey: 'currency_id'});
        order.belongsTo(models.Company, {
            foreignKey: 'sellerable_id',
            constraints: false,
            as: 'sellerable'
        });
        order.belongsTo(models.Company, {
            foreignKey: 'buyerable_id',
            constraints: false,
            as: 'buyerable'
        });
    };
    return order;
};