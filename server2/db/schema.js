import _ from 'lodash';
import bcrypt from 'bcrypt';
import {
    DataTypes,
} from 'sequelize';

import ProducerModel from './ProducerModel';
import ProductModel from './ProductModel';
import document from './document';
import PartyModel from './PartyModel';
import CompanyModel from './CompanyModel';
import StoreModel from './StoreModel';
import OrderModel from './OrderModel';
import DocumentLine from './DocumentLineModel';
import TransferInModel from './TransferInModel';
import ArrivalModel from './ArrivalModel';
import GoodModel from './GoodModel';
import ReserveModel from './ReserveModel';
import FutureReserveModel from './FutureReserveModel';
import InvoiceModel from './InvoiceModel';
import TransferOutModel from './TransferOutModel';
import DepartureModel from './DepartureModel';
import UserModel from './UserModel';
import TransferOutCorrectiveModel from './TransferOutCorrectiveModel';
import CurrencyModel from './CurrencyModel';
import Document from './DocumentModel';
import TransferInCorrectiveModel from './TransferInCorrectiveModel';
import Defective from './DefectiveModel';
import Undefective from './UndefectiveModel';
import MovementModel from './MovementModel';
import MovementOutModel from './MovementOutModel';
import ShellModel from './ShellModel';
import MovementInModel from './MovementInModel';
import ShipmentModel from './ShipmentModel';
import CategoryModel from './CategoryModel';
import AddressModel from './AddressModel';

export default {
    AccessToken: {
        options: {
            tableName: 'access_tokens',
            defaultScope: { include: [{ model: UserModel, as: 'user' }] },
        },
        attributes: {
            id: { type: DataTypes.STRING, primaryKey: true },
            userId: DataTypes.INTEGER,
            name: { type: DataTypes.STRING, defaultValue: 'Password Grant Client' },
            scopes: { type: DataTypes.JSON, defaultValue: [] },
            revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
            expiredAt: DataTypes.DATE,
        },
        relations: { belongsTo: { User: { foreignKey: 'userId', as: 'user' } } },
    },

    Address: {
        class: AddressModel,
        options: { tableName: 'addresses' },
        attributes: { address: DataTypes.STRING, json: DataTypes.JSON },
    },

    Arrival: {
        class: ArrivalModel,
        options: {
            tableName: 'arrivals',
            scopes: { withDocumentLine: { include: [{ model: DocumentLine, as: 'documentLine' }] } },
        },
        attributes: { document_line_id: DataTypes.INTEGER, ballance: DataTypes.INTEGER },
        relations: {
            belongsTo: {
                DocumentLine: {
                    foreignKey: 'document_line_id', as: 'documentLine',
                },
            },
            hasMany: {
                Reserve: { foreignKey: 'arrival_id', as: 'reserves' },
                Departure: { foreignKey: 'arrival_id', as: 'departures' },
            },
        },
    },

    Bank: {
        options: { tableName: 'banks' },
        attributes: {
            bik: { type: DataTypes.STRING, unique: true, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            json: DataTypes.JSON,
        },
    },

    BankAccount: {
        options: { tableName: 'bank_accounts' },
        attributes: {
            account: { type: DataTypes.STRING, allowNull: false, unique: 'bank_account' },
            bank_id: { type: DataTypes.INTEGER, allowNull: false, unique: 'bank_account' },
            company_id: { type: DataTypes.INTEGER, allowNull: false },
            currency_id: { type: DataTypes.STRING, allowNull: false },
        },
        relations: {
            belongsTo: {
                Bank: { foreignKey: 'bank_id', as: 'bank' },
                Company: { foreignKey: 'company_id', as: 'company' },
                Currency: { foreignKey: 'currency_id', as: 'currency' },
            },
        },
    },

    Category: {
        class: CategoryModel,
        options: { tableName: 'categories' },
        attributes: {
            name: DataTypes.STRING,
            lft: DataTypes.INTEGER,
            rgt: DataTypes.INTEGER,
            level: DataTypes.INTEGER,
            picture: DataTypes.STRING,
        },
        relations: { hasMany: { Product: { foreignKey: 'category_id', as: 'products' } } },
    },

    Company: {
        class: CompanyModel,
        options: {
            tableName: 'companies',
            defaultScope: { include: [{ model: PartyModel, as: 'party' }] },
            scopes: { withStores: { include: [{ model: StoreModel, as: 'stores' }] } },
        },
        attributes: {
            party_id: DataTypes.INTEGER,
            fact_address_id: DataTypes.INTEGER,
            own: { type: DataTypes.BOOLEAN, default: false },
            phone: DataTypes.STRING,
            picture: DataTypes.STRING,
            with_vat: { type: DataTypes.BOOLEAN, default: true },
        },
        relations: {
            belongsTo: {
                Address: { foreignKey: 'fact_address_id', as: 'factAddress' },
                Party: { foreignKey: 'party_id', as: 'party' },
            },
            hasMany: { Store: { foreignKey: 'company_id', as: 'stores' } },
        },
    },

    Currency: {
        class: CurrencyModel,
        options: { tableName: 'currencies' },
        attributes: {
            id: { type: DataTypes.STRING, primaryKey: true },
            num_code: DataTypes.STRING,
            char_code: DataTypes.STRING,
            nominal: DataTypes.INTEGER,
            name: DataTypes.STRING,
        },
    },

    CurrencyRate: {
        options: {
            tableName: 'currency_rates',
            defaultScope: { include: [{ model: CurrencyModel, as: 'currency' }] },
        },
        attributes: {
            currency_id: { type: DataTypes.STRING, unique: 'currencyOnDate' },
            date: { type: DataTypes.DATEONLY, unique: 'currencyOnDate' },
            rate: DataTypes.DECIMAL(18, 6),
        },
        relations: { belongsTo: { Currency: { foreignKey: 'currency_id', as: 'currency' } } },
    },

    Defective: document(Defective, Document, Document),

    Departure: {
        class: DepartureModel,
        options: { tableName: 'departures' },
        attributes: { document_line_id: DataTypes.INTEGER, arrival_id: DataTypes.INTEGER },
        relations: {
            belongsTo: {
                Arrival: { foreignKey: 'arrival_id', as: 'arrival' },
                DocumentLine: { foreignKey: 'document_line_id', as: 'documentLine' },
            },
        },
    },

    Document: document(Document, Document, Document),

    DocumentLine: {
        class: DocumentLine,
        options: {
            tableName: 'document_lines',
            scopes: {
                withArrival: { include: [{ model: ArrivalModel, as: 'arrival' }] },
                withChildren: { include: [{ model: DocumentLine, as: 'children' }] },
                withGood: {
                    include: [
                        {
                            model: GoodModel,
                            as: 'good',
                            include: [
                                {
                                    model: ProductModel,
                                    as: 'product',
                                    include: [{ model: ProducerModel, as: 'producer' }],
                                },
                            ],
                        },
                    ],
                },
                withFutureReserve: { include: [{ model: FutureReserveModel, as: 'futureReserve' }] },
                withParent: {
                    include: [{ model: DocumentLine, as: 'parent', include: [{ model: Document, as: 'document' }] }],
                },
                withReserves: { include: [{ model: ReserveModel, as: 'reserves' }] },
                withDeparture: { include: [{ model: DepartureModel, as: 'departure' }] },
            },
        },
        attributes: {
            document_id: { type: DataTypes.INTEGER, allowNull: false },
            parent_id: DataTypes.INTEGER,
            good_id: { type: DataTypes.INTEGER, allowNull: false },
            quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
            vat: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
            price_without_vat: { type: DataTypes.DECIMAL(18, 6), allowNull: false },
            price_with_vat: DataTypes.DECIMAL(18, 6),
            amount_without_vat: DataTypes.DECIMAL(18, 6),
            amount_with_vat: DataTypes.DECIMAL(18, 6),
            // store_id: DataTypes.INTEGER,
            times: { type: DataTypes.INTEGER, validate: { min: 1 } },
            state_customs_declaration_id: DataTypes.INTEGER,
            remark: DataTypes.STRING,
            closed: { type: DataTypes.BOOLEAN, defaultValue: false },
            from_good_id: DataTypes.INTEGER,
        },
        relations: {
            belongsTo: {
                Document: { foreignKey: 'document_id', as: 'document' },
                DocumentLine: {
                    foreignKey: 'parent_id', as: 'parent',
                },
                Good: [
                    { foreignKey: 'good_id', as: 'good' },
                    { foreignKey: 'from_good_id', as: 'fromGood' },
                ],
                StateCustomDeclaration: { foreignKey: 'state_customs_declaration_id', as: 'stateCustomsDeclaration' },
            },
            hasOne: {
                Arrival: { foreignKey: 'document_line_id', as: 'arrival' },
                Departure: { foreignKey: 'document_line_id', as: 'departure' },
                FutureReserve: { foreignKey: 'document_line_id', as: 'futureReserve' },
            },
            hasMany: {
                DocumentLine: { foreignKey: 'parent_id', as: 'children' },
                Reserve: { foreignKey: 'document_line_id', as: 'reserves' },
            },
        },
    },

    DocumentType: {
        options: { tableName: 'document_types' },
        attributes: {
            id: { type: DataTypes.STRING, primaryKey: true },
            name: { type: DataTypes.STRING, unique: true },
        },
    },

    FutureReserve: {
        class: FutureReserveModel,
        options: {
            tableName: 'future_reserves',
            scopes: {
                withGood(good) {
                    return {
                        include: [
                            {
                                model: DocumentLine,
                                as: 'documentLine',
                                include: [
                                    { model: GoodModel, as: 'good', where: { id: good.id } },
                                    { model: Document, as: 'document' },
                                ],
                            },
                        ],
                        order: [
                            [
                                { model: DocumentLine, as: 'documentLine' },
                                { model: Document, as: 'document' },
                                'document_type_id',
                                'desc',
                            ],
                            ['createdAt', 'desc'],
                        ],
                    };
                },
            },
        },
        attributes: { document_line_id: DataTypes.INTEGER, ballance: DataTypes.INTEGER },
        relations: { belongsTo: { DocumentLine: { foreignKey: 'document_line_id', as: 'documentLine' } } },
    },

    Good: {
        class: GoodModel,
        options: {
            tableName: 'goods',
            scopes: {
                withProduct: { include: [{ model: ProductModel, as: 'product' }] },
                withStore: {
                    include: [{
                        model: StoreModel,
                        as: 'store',
                        include: [{ model: CompanyModel, as: 'company' }],
                    }],
                },
            },
        },
        attributes: {
            store_id: { type: DataTypes.INTEGER, unique: 'goods_store_id_product_id_code_unique' },
            product_id: { type: DataTypes.INTEGER, unique: 'goods_store_id_product_id_code_unique' },
            ballance: { type: DataTypes.INTEGER, defaultValue: 0 },
            code: { type: DataTypes.STRING, unique: 'goods_store_id_product_id_code_unique' },
            pack: { type: DataTypes.INTEGER, defaultValue: 1 },
            multiply: { type: DataTypes.INTEGER, defaultValue: 1 },
            is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        relations: {
            belongsTo: {
                Store: { foreignKey: 'store_id', as: 'store' },
                Product: { foreignKey: 'product_id', as: 'product' },
            },
        },
    },

    InterStoreRoute: {
        options: { tableName: 'inter_store_routes' },
        attributes: {
            from_store_id: { type: DataTypes.INTEGER },
            to_store_id: { type: DataTypes.INTEGER },
            name: DataTypes.STRING,
            minimum_days: { type: DataTypes.INTEGER, defaultValue: 0 },
            maximum_days: { type: DataTypes.INTEGER, defaultValue: 0 },
            average_days: { type: DataTypes.INTEGER, defaultValue: 0 },
            is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        relations: {
            belongsTo: {
                Store: [
                    { foreignKey: 'from_store_id', as: 'fromStore' },
                    { foreignKey: 'to_store_id', as: 'toStore' },
                ],
            },
        },
    },

    Invoice: document(InvoiceModel, Document, TransferOutModel),

    Movement: document(MovementModel, Document, MovementOutModel),

    MovementIn: document(MovementInModel, MovementOutModel, Document),

    MovementOut: document(MovementOutModel, MovementModel, MovementInModel),

    Order: document(OrderModel, Document, TransferInModel),

    Parameter: {
        options: { tableName: 'parameters' },
        attributes: {
            product_id: { type: DataTypes.INTEGER, unique: 'parameters_product_id_parameter_name_id_unique' },
            parameter_name_id: { type: DataTypes.INTEGER, unique: 'parameters_product_id_parameter_name_id_unique' },
            parameter_value_id: DataTypes.INTEGER,
            unit_id: DataTypes.INTEGER,
            numeric_value: DataTypes.DECIMAL(24, 12),
        },
        relations: {
            belongsTo: {
                ParameterName: { foreignKey: 'parameter_name_id', as: 'parameterName' },
                Product: { foreignKey: 'product_id', as: 'product' },
                ParameterValue: { foreignKey: 'parameter_value_id', as: 'parameterValue' },
                Unit: { foreignKey: 'unit_id', as: 'unit' },
            },
        },
    },

    ParameterName: {
        options: { tableName: 'parameter_names' },
        attributes: {
            name: DataTypes.STRING,
            alias: DataTypes.STRING,
            type: DataTypes.INTEGER, // 0 - text, 1 - number
            base_unit_id: DataTypes.INTEGER,
        },
        relations: {
            belongsTo: {
                Unit: {
                    foreignKey: 'base_unit_id',
                    sourceKey: 'id',
                    as: 'baseUnit',
                },
            },
        },
    },

    ParameterValue: {
        options: { tableName: 'parameter_values' },
        attributes: {
            name: { type: DataTypes.STRING, unique: 'parameter_values_name_parameter_name_id_unique' },
            parameter_name_id: { type: DataTypes.INTEGER, unique: 'parameter_values_name_parameter_name_id_unique' },
            right_parameter_value_id: DataTypes.INTEGER,
        },
        relations: {
            belongsTo: {
                ParameterName: {
                    foreignKey: 'parameter_name_id',
                    sourceKey: 'id',
                    as: 'parameterName',
                },
                ParameterValue: {
                    foreignKey: 'right_parameter_value_id',
                    sourceKey: 'id',
                    as: 'rightParameterValue',
                },
            },
        },
    },

    Party: {
        class: PartyModel,
        options: { tableName: 'parties' },
        attributes: {
            inn: DataTypes.STRING,
            name: DataTypes.STRING,
            ogrn: DataTypes.STRING,
            json: DataTypes.JSON,
        },
    },

    Payment: {
        options: { tableName: 'payments' },
        attributes: {
            bank_account_from_id: { type: DataTypes.INTEGER, allowNull: false },
            bank_account_to_id: { type: DataTypes.INTEGER, allowNull: false },
            number: { type: DataTypes.STRING, allowNull: false },
            date: { type: DataTypes.DATE, allowNull: false },
            purpose: { type: DataTypes.STRING, allowNull: false },
            amount: { type: DataTypes.DECIMAL(18, 6) },
        },
        relations: {
            belongsTo: {
                BankAccount: [
                    { foreignKey: 'bank_account_from_id', a: 'bankAccountFrom' },
                    { foreignKey: 'bank_account_to_id', a: 'bankAccountTo' },
                ],
            },
        },
    },

    Picture: {
        options: { tableName: 'pictures' },
        attributes: { name: DataTypes.STRING, model_id: DataTypes.INTEGER, model_type: DataTypes.STRING },
    },

    Price: {
        options: { tableName: 'prices' },
        attributes: {
            good_id: DataTypes.INTEGER,
            currency_id: DataTypes.STRING,
            min: DataTypes.INTEGER,
            max: DataTypes.INTEGER,
            our_price: DataTypes.DECIMAL(18, 6),
            for_all_price: DataTypes.DECIMAL(18, 6),
        },
        relations: {
            belongsTo: {
                Good: { foreignKey: 'good_id', as: 'good' },
                Currency: { foreignKey: 'currency_id', as: 'currency' },
            },
        },
    },

    Producer: {
        class: ProducerModel,
        options: {
            tableName: 'producers',
            scopes: {
                rightProducer: {
                    include: [{ model: ProducerModel, as: 'rightProducer' }],
                },
            },
        },
        attributes: {
            name: { type: DataTypes.STRING, unique: true },
            site: DataTypes.STRING,
            right_producer_id: { type: DataTypes.INTEGER },
            picture: DataTypes.STRING,
        },
        relations: {
            belongsTo: {
                Producer: {
                    foreignKey: 'right_producer_id',
                    sourceKey: 'id',
                    as: 'rightProducer',
                },
            },
        },
    },

    Product: {
        class: ProductModel,
        options: {
            tableName: 'products',
            scopes: {
                withProducer: { include: [{ model: ProducerModel, as: 'producer' }] },
                withCategory: { include: [{ model: CategoryModel, as: 'category' }] },
            },
        },
        attributes: {
            name: { type: DataTypes.STRING, unique: 'product_name_producer_id' },
            search_name: DataTypes.STRING,
            vat: { type: DataTypes.DECIMAL, defaultValue: 20.00 },
            category_id: { type: DataTypes.INTEGER },
            producer_id: { type: DataTypes.INTEGER, unique: 'product_name_producer_id' },
            remark: DataTypes.TEXT,
            picture: DataTypes.STRING,
            right_product_id: { type: DataTypes.INTEGER },
        },
        relations: {
            belongsTo: {
                Category: { foreignKey: 'category_id', as: 'category' },
                Producer: { foreignKey: 'producer_id', as: 'producer' },
                Product: {
                    foreignKey: 'right_product_id',
                    sourceKey: 'id',
                    as: 'rightProduct',
                },
            },
            hasMany: { Parameter: { foreignKey: 'product_id', as: 'parameters' } },
        },
    },

    Reserve: {
        class: ReserveModel,
        options: {
            tableName: 'reserves',
            scopes: {
                withDocumentLine: { include: [{ model: DocumentLine, as: 'documentLine' }] },
                closed(documentId) {
                    return {
                        where: { closed: true },
                        include: [
                            { model: DocumentLine, as: 'documentLine', where: { document_id: documentId } },
                        ],
                    };
                },
            },
        },
        attributes: {
            document_line_id: DataTypes.INTEGER,
            arrival_id: DataTypes.INTEGER,
            quantity: DataTypes.INTEGER,
            closed: DataTypes.BOOLEAN,
        },
        relations: {
            belongsTo: {
                Arrival: { foreignKey: 'arrival_id', as: 'arrival' },
                DocumentLine: { foreignKey: 'document_line_id', as: 'documentLine' },
            },
        },
    },

    Shell: {
        class: ShellModel,
        options: {
            tableName: 'shells',
            uniqueKeys: {
                cu_user_table: {
                    fields: ['user_id', 'table'],
                },
            },
        },
        attributes: {
            user_id: { type: DataTypes.INTEGER, unique: 'cu_user_table' },
            table: { type: DataTypes.STRING, unique: 'cu_user_table' },
            version: DataTypes.STRING,
            basket: DataTypes.JSON,
            columns: DataTypes.JSON,
            optics: DataTypes.JSON,
        },
    },

    Shipment: {
        class: ShipmentModel,
        options: { tableName: 'shipments' },
        attributes: {
            number: { type: DataTypes.STRING, unique: 'shipment_company_number', allowNull: false },
            company_id: { type: DataTypes.INTEGER, unique: 'shipment_company_number', allowNull: false },
            date: { type: DataTypes.DATE, allowNull: false },
            arrival_date: { type: DataTypes.DATE, allowNull: false },
            from_store_id: { type: DataTypes.INTEGER, allowNull: false },
            to_store_id: { type: DataTypes.INTEGER, allowNull: false },
            status_id: { type: DataTypes.STRING, defaultValue: 'formed' },
        },
        relations: {
            belongsTo: {
                Company: { foreignKey: 'company_id', as: 'company', onDelete: 'RESTRICT' },
                Store: [
                    { foreignKey: 'from_store_id', as: 'fromStore', onDelete: 'RESTRICT' },
                    { foreignKey: 'to_store_id', as: 'toStore', onDelete: 'RESTRICT' },
                ],
            },
            belongsToMany: {
                Document: {
                    through: 'shipment_document',
                    as: 'documents',
                    foreignKey: 'shipment_id',
                    otherKey: 'document_id',
                },
            },
        },
    },

    ShipmentDocument: {
        options: { tableName: 'shipment_document' },
        attributes: {
            shipment_id: DataTypes.INTEGER,
            document_id: DataTypes.INTEGER,
        },
        relations: {
            belongsTo: {
                Shipment: { foreignKey: 'shipment_id', as: 'shipment', onDelete: 'RESTRICT' },
                Document: { foreignKey: 'document_id', as: 'document', onDelete: 'RESTRICT' },
            },
        },
    },

    StateCustomDeclaration: {
        options: { tableName: 'state_custom_declarations' },
        attributes: { number: DataTypes.STRING, country_code: DataTypes.STRING, country_short_name: DataTypes.STRING },
    },

    Store: {
        class: StoreModel,
        options: {
            tableName: 'stores',
            scopes: {
                withCompany: {
                    include: [{ model: CompanyModel, as: 'company', include: { model: PartyModel, as: 'party' } }],
                },
                withAddress: { include: [{ model: AddressModel, as: 'address' }] },
            },
        },
        attributes: {
            name: DataTypes.STRING,
            phone: DataTypes.STRING,
            company_id: DataTypes.INTEGER,
            address_id: DataTypes.INTEGER,
            online: DataTypes.BOOLEAN,
            is_main: DataTypes.BOOLEAN,
            icon: DataTypes.STRING(400),
        },
        relations: {
            belongsTo: {
                Company: { foreignKey: 'company_id', as: 'company' },
                Address: { foreignKey: 'address_id', as: 'address' },
            },
            hasMany: { InterStoreRoute: { as: 'fromRoutes', foreignKey: 'from_store_id' } },
        },
    },

    TransferIn: _.defaultsDeep({
        options: {
            scopes: {
                deepDocumentLines: {
                    include: [
                        { model: DocumentLine, as: 'documentLines', include: [{ model: ArrivalModel, as: 'arrival' }] },
                    ],
                },
            },
        },
    }, document(TransferInModel, OrderModel, TransferOutCorrectiveModel)),

    TransferInCorrective: _.defaultsDeep({
        options: {
            scopes: {
                deepDocumentLines: {
                    include: [
                        {
                            model: DocumentLine,
                            as: 'documentLines',
                            include: [
                                { model: DepartureModel, as: 'departure' },
                                { model: ReserveModel, as: 'reserves' },
                            ],
                        },
                    ],
                },
            },
        },
    }, document(TransferInCorrectiveModel, TransferOutModel, Document)),

    TransferOut: _.defaultsDeep({
        options: {
            scopes: {
                deepDocumentLines: {
                    include: [
                        {
                            model: DocumentLine,
                            as: 'documentLines',
                            include: [{ model: DepartureModel, as: 'departure' }],
                        },
                    ],
                },
            },
        },
    }, document(TransferOutModel, InvoiceModel, TransferInCorrectiveModel)),

    TransferOutCorrective: _.defaultsDeep({
        options: {
            scopes: {
                deepDocumentLines: {
                    include: [
                        {
                            model: DocumentLine,
                            as: 'documentLines',
                            include: [
                                { model: DepartureModel, as: 'departure' },
                                { model: ReserveModel, as: 'reserves' },
                            ],
                        },
                    ],
                },
            },
        },
    }, document(TransferOutCorrectiveModel, TransferInModel, Document)),

    Unit: {
        options: { tableName: 'units' },
        attributes: {
            base_unit_id: { type: DataTypes.INTEGER, unique: 'units_base_unit_id_coeff_unique' },
            name: DataTypes.STRING,
            alias: DataTypes.STRING,
            divide: { type: DataTypes.BOOLEAN, defaultValue: true },
            coeff: { type: DataTypes.INTEGER, defaultValue: 1, unique: 'units_base_unit_id_coeff_unique' },
        },
        relations: {
            belongsTo: {
                Unit: {
                    foreignKey: 'base_unit_id',
                    sourceKey: 'id',
                    as: 'baseUnit',
                },
            },
        },
    },

    Undefective: document(Undefective, Document, Document),

    User: {
        class: UserModel,
        options: {
            tableName: 'users',
            defaultScope: {
                attributes: { exclude: ['password', 'salt'] },
            },
            scopes: { withPassword: {} },
        },
        attributes: {
            id: { autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
            name: { type: DataTypes.STRING, notEmpty: true },
            email: { type: DataTypes.STRING, validate: { isEmail: true } },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                set(password) {
                    const salt = bcrypt.genSaltSync();
                    this.setDataValue('salt', salt);
                    this.setDataValue('password', bcrypt.hashSync(password, salt));
                },
            },
            salt: DataTypes.STRING,
            options: { type: DataTypes.JSON, defaultValue: { } },
            avatar: { type: DataTypes.STRING, defaultValue: '/default/avatar.svg' },
            skills: { type: DataTypes.JSON, defaultValue: { interface: 0, sales: 0, computer: 0 } },
            cards: { type: DataTypes.JSON, defaultValue: { invoice: null, orders: [] } },
        },
    },
};
