import axios from 'axios';
import fs from 'fs';
import unzipper from 'unzipper';
import XLSX from 'xlsx';
import _ from 'lodash';
import app from '../index';
import { getXlsxData } from '../services/utils';

module.exports.run = async () => {
    const { logger, db, config } = app.services;
    const {
        Currency, Company, Good, Product, Producer, Parameter, ParameterName, ParameterValue, Price,
    } = db.models;
    const start = new Date();

    const response = await axios.get(config.companies.compel.stores.main.url, { responseType: 'arraybuffer' });
    const directory = await unzipper.Open.buffer(response.data);
    await new Promise((resolve, reject) => {
        const file = fs.createWriteStream('./storage/COMPELDISTI3_ext_TI.dbf');
        directory.files[0]
            .stream()
            .pipe(file)
            .on('error', reject)
            .on('finish', resolve);
    });

    logger.info({}, 'Compel downloading finish.');

    const workbook = await XLSX.readFile('./storage/COMPELDISTI3_ext_TI.dbf');
    const sheet = await workbook.Sheets[_.first(workbook.SheetNames)];

    const fromRow = 2;
    const company = await Company.getByAlias('compel');
    const store = _.find(company.stores, { is_main: true });
    const currency = await Currency.findOne({ where: { char_code: 'USD' } });
    // eslint-disable-next-line no-underscore-dangle
    const case_ = await ParameterName.getInstance({ alias: 'case' });
    let product = {};
    let price = [];
    let cost = 0;
    let good = { store_id: store.id };
    let goodAdditional = {};
    let ballance = 0;
    let caseValue;
    let prices;
    let j;

    // eslint-disable-next-line no-unused-vars
    for (const z in sheet) {
        if (z[0] === '!') continue;
        const { col, row, value } = getXlsxData(z, sheet);
        if (row < fromRow) continue;
        switch (col) {
        case 'A':
            good.code = value;
            break;
        case 'C':
            product.name = value;
            break;
        case 'D':
            product.producer_id = (await Producer.getRightInstanceOrCreate({ name: value || 'NONAME' })).id;
            break;
        case 'E':
            goodAdditional.pack = value;
            break;
        case 'G':
            ballance = value;
            break;
        case 'R':
            caseValue = value;
            break;
        case 'X':
            goodAdditional.multiply = value === 0 ? 1 : goodAdditional.pack;
            break;
        case 'H':
        case 'J':
        case 'L':
        case 'N':
        case 'P':
            cost = value;
            break;
        case 'I':
        case 'K':
        case 'M':
        case 'O':
        case 'Q':
            if (cost !== 0) {
                price.push({
                    min: value === 0 ? 1 : value,
                    our_price: cost,
                    for_all_price: 0,
                    currency_id: currency.id,
                });
                cost = 0;
            }
            break;
        case 'AB':
            // Update ir Create Good
            [good] = await Good.findOrBuild({ where: good });
            if (good.isNewRecord) {
                product = await Product.getRightInstanceOrCreate(product);
                goodAdditional.product_id = product.id;
                good.set(goodAdditional);
            }
            good.set({ ballance, is_active: true });
            good.changed('updatedAt', true);
            await good.save();
            // Update Case for Product
            if (caseValue) {
                caseValue = await ParameterValue.getRightInstanceOrCreate(
                    { name: caseValue, parameter_name_id: case_.id },
                );
                await Parameter.findOrCreate({
                    where: { product_id: good.product_id, parameter_name_id: case_.id },
                    defaults: { parameter_value_id: caseValue.id },
                });
            }
            // Update prices
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < price.length; i++) {
                if (i > 0) {
                    price[i - 1].max = price[i].min - 1;
                }
                price[i].good_id = good.id;
            }
            price[price.length - 1].max = ballance;
            prices = await Price.findAll({ where: { good_id: good.id } });
            j = 0;
            while (j < prices.length) {
                if (j < price.length) {
                    await prices[j].update(price[j]);
                } else {
                    await prices[j].destroy();
                }
                j += 1;
            }
            while (j < price.length) {
                await Price.create(price[j]);
                j += 1;
            }

            product = {};
            price = [];
            cost = 0;
            good = { store_id: store.id };
            goodAdditional = {};
            ballance = 0;
            caseValue = undefined;
            break;
        default:
            break;
        }
    }
    const d = await Good.disactivate(store.id, start);
    logger.info({ count: d }, 'Goods from Compel was disactivated');
};
