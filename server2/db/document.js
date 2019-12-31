import { DataTypes } from 'sequelize';
import DocumentLine from './DocumentLineModel';
import Company from './CompanyModel';
import Party from './PartyModel';
import Currency from './CurrencyModel';
import Store from './StoreModel';

export default {
    options: {
        tableName: 'documents',
        defaultScope: {},
        scopes: {
            withBuyerable: { include: [{ model: Company, as: 'buyerable', include: [{ model: Party, as: 'party' }] }] },
            withCurrency: { include: [{ model: Currency, as: 'currency' }] },
            withDocumentLines: { include: [{ model: DocumentLine, as: 'documentLines' }] },
            withForeignStore: { include: [{ model: Store, as: 'foreignStore' }] },
            withSellerable: { include: [{ model: Company, as: 'sellerable', include: [{ model: Party, as: 'party' }] }] },
            withStore: { include: [{ model: Store, as: 'store' }] },
        },
    },
    attributes: {
        date: { type: DataTypes.DATE, defaultValue: new Date() },
        number: DataTypes.INTEGER,
        user_id: { type: DataTypes.INTEGER },
        document_type_id: { type: DataTypes.STRING },
        parent_id: DataTypes.INTEGER,
        sellerable_id: { type: DataTypes.INTEGER, allowNull: false },
        sellerable_type: { type: DataTypes.STRING, defaultValue: 'Company', allowNull: false },
        buyerable_id: { type: DataTypes.INTEGER, allowNull: false },
        buyerable_type: { type: DataTypes.STRING, defaultValue: 'Company', allowNull: false },
        store_id: { type: DataTypes.INTEGER },
        foreign_store_id: { type: DataTypes.INTEGER },
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
            Store: [
                { foreignKey: 'store_id', as: 'store' },
                { foreignKey: 'foreign_store_id', as: 'foreignStore' },
            ],
            Currency: { foreignKey: 'currency_id', as: 'currency' },
        },
        hasMany: {
            DocumentLine: { foreignKey: 'document_id', as: 'documentLines' },
        },
    },
};
