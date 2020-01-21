import unzipper from 'unzipper';
import fs from 'fs';
import request from 'request';
import app from '../index';
import { getXlsxData } from '../services/utils';

const _ = require('lodash');
const XLSX = require('xlsx');

const { db, logger, config } = app.services;
const {
    Currency, Company, Good, Product, Producer, Parameter, ParameterName, ParameterValue, Price,
} = db.models;

module.exports.run = async () => {
    const start = new Date();


    const zip = await unzipper.Open.url(request, config.companies.dan.stores.main.url);
    await new Promise((resolve, reject) => {
        zip.files[0]
            .stream(config.companies.dan.stores.main.pass)
            .pipe(fs.createWriteStream('./storage/dan_dealer.xls'))
            .on('error', reject)
            .on('finish', resolve);
    });

    logger.info({}, 'DAN downloading finish.');

    const company = await Company.getByAlias('dan');
    const store = _.find(company.stores, { is_main: true });
    const currency = await Currency.findOne({ where: { char_code: 'RUB' } });
    // eslint-disable-next-line no-underscore-dangle
    const case_ = await ParameterName.getInstance({ alias: 'case' });
    const workbook = XLSX.readFile('./storage/dan_dealer.xls');
    const sheet = workbook.Sheets[_.first(workbook.SheetNames)];
    const fromRow = 3;

    let product = {};
    let price = { min: 1, currency_id: currency.id };
    let good = { store_id: store.id };
    let ballance = 0;
    let remark = '';
    let caseValue;

    // eslint-disable-next-line no-unused-vars
    for (const z in sheet) {
        if (z[0] === '!') continue;
        const { col, row, value } = getXlsxData(z, sheet);
        if (row < fromRow) continue;
        switch (col) {
        case 'A':
            if (good.code && price.our_price) {
                [good] = await Good.findOrBuild({ where: good });
                if (good.isNewRecord) {
                    product = await Product.getRightInstanceOrCreate(product, { remark });
                    good.set({ product_id: product.id, pack: 1, multiply: 1 });
                }
                good.set({ ballance, is_active: true });
                good.changed('updatedAt', true);
                await good.save();
                if (caseValue) {
                    caseValue = await ParameterValue.getRightInstanceOrCreate(
                        { name: caseValue, parameter_name_id: case_.id },
                    );
                    await Parameter.findOrCreate({
                        where: { product_id: good.product_id, parameter_name_id: case_.id },
                        defaults: { parameter_value_id: caseValue.id },
                    });
                }
                await Price.updateInstanceOrCreate({ good_id: good.id }, price);
            }
            // clear values
            product = {};
            price = { min: 1, currency_id: currency.id };
            good = { store_id: store.id };
            ballance = 0;
            remark = '';
            caseValue = undefined;
            break;
        case 'B':
            good.code = value;
            break;
        case 'C':
            product.name = value;
            break;
        case 'D':
            remark = value;
            break;
        case 'E':
            caseValue = value;
            break;
        case 'F':
            product.producer_id = (await Producer.getRightInstanceOrCreate({ name: value || 'NONAME' })).id;
            break;
        case 'H':
            price.our_price = value;
            price.for_all_price = value * 1.25;
            break;
        case 'I':
            ballance = value;
            price.max = value;
            break;
        default:
            break;
        }
    }
    const d = await Good.disactivate(store.id, start);
    logger.info({ count: d }, 'Goods from Dan was disactivated');
};
