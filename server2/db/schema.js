import _ from 'lodash';
import { DataTypes } from 'sequelize';
import ProducerModel from './ProducerModel';
import ProductModel from './ProductModel';
import document from './document';
import PartyModel from './PartyModel';
import CompanyModel from './CompanyModel';
import StoreModel from './StoreModel';

export default {
    Address: {
        options: { tableName: 'addresses' },
        attributes: { address: DataTypes.STRING, json: DataTypes.JSON },
    },

    Arrival: {
        options: { tableName: 'arrivals' },
        attributes: { document_line_id: DataTypes.INTEGER, ballance: DataTypes.INTEGER },
        relations: {
            belongsTo: { DocumentLine: { foreignKey: 'document_line_id', as: 'documentLine' } },
            hasMany: {
                Reserve: { foreignKey: 'arrival_id', as: 'reserves' },
                Departure: { foreignKey: 'arrival_id', as: 'departures' },
            },
        },
    },

    Category: {
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
        options: { tableName: 'currency_rates' },
        attributes: {
            currency_id: { type: DataTypes.STRING, unique: 'currencyOnDate' },
            date: { type: DataTypes.DATEONLY, unique: 'currencyOnDate' },
            rate: DataTypes.DECIMAL(18, 6),
        },
        relations: { belongsTo: { Currency: { foreignKey: 'currency_id', as: 'currency' } } },
    },

    Departure: {
        options: { tableName: 'departures' },
        attributes: { document_line_id: DataTypes.INTEGER, arrival_id: DataTypes.INTEGER },
        relations: {
            belongsTo: {
                Arrival: { foreignKey: 'arrival_id', as: 'arrival' },
                DocumentLine: { foreignKey: 'document_line_id', as: 'documentLine' },
            },
        },
    },

    Document: document,

    DocumentLine: {
        options: { tableName: 'document_lines' },
        attributes: {
            document_id: DataTypes.INTEGER,
            parent_id: DataTypes.INTEGER,
            good_id: DataTypes.INTEGER,
            quantity: DataTypes.INTEGER,
            vat: DataTypes.DECIMAL(8, 2),
            price_without_vat: DataTypes.DECIMAL(18, 6),
            price_with_vat: DataTypes.DECIMAL(18, 6),
            amount_without_vat: DataTypes.DECIMAL(18, 6),
            amount_with_vat: DataTypes.DECIMAL(18, 6),
            store_id: DataTypes.INTEGER,
            times: DataTypes.INTEGER,
            state_customs_declaration_id: DataTypes.INTEGER,
            remark: DataTypes.STRING,
            closed: { type: DataTypes.BOOLEAN, defaultValue: false },
            from_good_id: DataTypes.INTEGER,
        },
        relations: {
            belongsTo: {
                Document: { foreignKey: 'document_id', as: 'document' },
                DocumentLine: { foreignKey: 'parent_id', as: 'parent' },
                Good: [
                    { foreignKey: 'good_id', as: 'good' },
                    { foreignKey: 'from_good_id', as: 'fromGood' },
                ],
                Store: { foreignKey: 'store_id', as: 'store' },
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
        options: { tableName: 'future_resreves' },
        attributes: { document_line_id: DataTypes.INTEGER, ballance: DataTypes.INTEGER },
        relations: { belongsTo: { DocumentLine: { foreignKey: 'document_line_id', as: 'documentLine' } } },
    },

    Good: {
        options: { tableName: 'goods' },
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

    Invoice: _.defaultsDeep({
        options: {
            defaultScope: { where: { document_type_id: 'invoice' } },
        },
        attributes: {
            document_type_id: { defaultValue: 'invoice' },
        },
    }, document),

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

    Picture: {
        options: { tableName: 'pictures' },
        attributes: { name: DataTypes.STRING, model_id: DataTypes.INTEGER, model_type: DataTypes.STRING },
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
                    constraints: false,
                    as: 'rightProducer',
                },
            },
        },
    },

    Product: {
        class: ProductModel,
        options: {
            tableName: 'products',
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
                    constraints: false,
                    as: 'rightProduct',
                },
            },
        },
    },

    Reserve: {
        options: { tableName: 'resreves' },
        attributes: {
            document_line_id: DataTypes.INTEGER,
            arrival_id: DataTypes.INTEGER,
            quantity: DataTypes.INTEGER,
            closed: DataTypes.BOOLEAN,
        },
        relations: {
            belongsTo: {
                Arrival: { foreignKey: 'arrival_id', as: 'arrival' },
                DocumentLine: { foreignKey: 'document_line_id', as: 'documentLibe' },
            },
        },
    },

    StateCustomDeclaration: {
        options: { tableName: 'state_custom_declarations' },
        attributes: { number: DataTypes.STRING, country_code: DataTypes.STRING, country_short_name: DataTypes.STRING },
    },

    Store: {
        class: StoreModel,
        options: { tableName: 'stores' },
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
            belongsTo: { Company: { foreignKey: 'company_id', as: 'company' } },
            hasMany: { InterStoreRoute: { as: 'fromRoutes', foreignKey: 'from_store_id' } },
        },
    },

    User: {
        options: {
            tableName: 'users',
        },
        attributes: {
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            name: {
                type: DataTypes.STRING,
                notEmpty: true,
            },
            email: {
                type: DataTypes.STRING,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            options: {
                type: DataTypes.JSON,
            },
            avatar: {
                type: DataTypes.STRING,
            },
            skills: {
                type: DataTypes.JSON,
                defaultValue: { interface: 0, sales: 0, computer: 0 },
            },
        },
    },
};
