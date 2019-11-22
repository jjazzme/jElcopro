import { DataTypes } from 'sequelize';

export default {
    options: { tableName: 'documents' },
    attributes: {
        date: { type: DataTypes.DATE, defaultValue: new Date() },
        number: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        document_type_id: { type: DataTypes.STRING },
        parent_id: DataTypes.INTEGER,
        sellerable_id: DataTypes.INTEGER,
        sellerable_type: { type: DataTypes.STRING, defaultValue: 'Company', allowNull: false },
        buyerable_id: DataTypes.INTEGER,
        buyerable_type: { type: DataTypes.STRING, defaultValue: 'Company', allowNull: false },
        store_id: DataTypes.INTEGER,
        foreign_store_id: DataTypes.INTEGER,
        closed: { type: DataTypes.BOOLEAN, defaultValue: false },
        currency_id: { type: DataTypes.STRING, defaultValue: 'R01000' },
        number_prefix: DataTypes.STRING,
        status_id: { type: DataTypes.STRING, defaultValue: 'formed' },
    },
    relations: {
        belongsTo: {
            User: { foreignKey: 'user_id', as: 'user' },
            Company: [
                { foreignKey: 'sellerable_id', constraints: false, as: 'sellerable' },
                { foreignKey: 'buyerable_id', constraints: false, as: 'buyerable' },
            ],
            DocumentType: { foreignKey: 'document_type_id', as: 'documentType' },
            Document: { foreignKey: 'parent_id', constraints: false, as: 'parent' },
            Store: [
                { foreignKey: 'store_id', as: 'store' },
                { foreignKey: 'foreign_store_id', as: 'foreignStore' },
            ],
            Currency: { foreignKey: 'currency_id', as: 'currency' },
        },
        hasMany: {
            Document: { foreignKey: 'parent_id', as: 'children' },
            DocumentLine: { foreignKey: 'document_id', as: 'documentLines' },
        },
    },
};
