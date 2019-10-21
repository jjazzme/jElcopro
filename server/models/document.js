'use strict';

module.exports = (sequelize, DataTypes) => {
    var Document = sequelize.define('Document', {
        date: DataTypes.DATE,
        number: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        document_type_id: DataTypes.STRING,
        parent_id: DataTypes.INTEGER,
        sellerable_id: DataTypes.INTEGER,
        sellerable_type: DataTypes.STRING,
        buyerable_id: DataTypes.INTEGER,
        buyerable_type: DataTypes.STRING,
        store_id: DataTypes.INTEGER,
        foreign_store_id: DataTypes.INTEGER,
        closed: DataTypes.BOOLEAN,
        currency_id: DataTypes.STRING,
        number_prefix: DataTypes.STRING,
        status_id: DataTypes.STRING,
    }, {
        freezeTableName: true,
        tableName: 'documents'
    });
    Document.associate = function(models) {
        Document.belongsTo(models.User, {foreignKey: 'user_id'});
        Document.belongsTo(models.documentType, {foreignKey:'document_type_id'});
        Document.belongsTo(models.Document, {foreignKey: 'parent_id', constraints:false, as: 'parent'});
        Document.belongsTo(models.Store, {foreignKey:'store_id'});
        Document.belongsTo(models.Store, {foreignKey:'foreign_store_id'});
        Document.belongsTo(models.Currency, {foreignKey: 'currency_id'});
    };
    return Document;
};