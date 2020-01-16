import { DataTypes, literal } from 'sequelize';
import _ from 'lodash';
import DocumentLine from './DocumentLineModel';
import Company from './CompanyModel';
import Party from './PartyModel';
import Currency from './CurrencyModel';
import Store from './StoreModel';
import UserModel from "./UserModel";

export default (DocumentModel, ParentModel, ChildModel) => ({
    class: DocumentModel,
    options: {
        tableName: 'documents',
        defaultScope: DocumentModel.name === 'Document'
            ? {}
            : { where: { document_type_id: _.kebabCase(DocumentModel.name) } },
        scopes: {
            withBuyerable: { include: [{ model: Company, as: 'buyerable', include: [{ model: Party, as: 'party' }] }] },
            withChildren: { include: [{ model: ChildModel, as: 'children' }] },
            withCurrency: { include: [{ model: Currency, as: 'currency' }] },
            withDocumentLines: { include: [{ model: DocumentLine, as: 'documentLines' }] },
            withForeignStore: { include: [{ model: Store, as: 'foreignStore' }] },
            withParent: { include: [{ model: ParentModel, as: 'parent' }] },
            withSellerable: {
                include: [{ model: Company, as: 'sellerable', include: [{ model: Party, as: 'party' }] }],
            },
            withStore: { include: [{ model: Store, as: 'store' }] },
            withSum: {
                attributes: {
                    include: [
                        [
                            literal(`${'COALESCE('
                            + '(SELECT sum(a.amount_with_vat) FROM document_lines a '
                            + 'WHERE a.document_id = `'}${DocumentModel.name}\`.\`id\`), 0)`),
                            'amount_with_vat',
                        ],
                        [
                            literal(`${'COALESCE('
                            + '(SELECT count(a.id) FROM document_lines a '
                            + 'WHERE a.document_id = `'}${DocumentModel.name}\`.\`id\`), 0)`),
                            'count_document_lines',
                        ],
                    ],
                },
            },
            withUser: { include: [{ model: UserModel, as: 'user' }] },
        },
    },
    attributes: {
        date: { type: DataTypes.DATE, defaultValue: new Date() },
        number: DataTypes.INTEGER,
        user_id: { type: DataTypes.INTEGER },
        document_type_id: { type: DataTypes.STRING, defaultValue: _.kebabCase(DocumentModel.name) },
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
            [ParentModel.name]: { foreignKey: 'parent_id', as: 'parent' },
        },
        belongsToMany: {
            Shipment: {
                through: 'shipment_document',
                as: 'shipments',
                foreignKey: 'document_id',
                otherKey: 'shipment_id',
            },
        },
        hasMany: {
            DocumentLine: { foreignKey: 'document_id', as: 'documentLines' },
            [ChildModel.name]: { foreignKey: 'parent_id', as: 'children' },
        },
    },
});
