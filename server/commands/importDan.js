'use strict';

const XLSX = require('xlsx');
const _ = require('lodash');

import db from '../models/index';
const Op = db.Sequelize.Op;

import { getData } from "../services/getRowColInXlsX";

import GoodService from "../services/GoodService";
import CompanyService from "../services/CompanyService";
import ProducerService from "../services/ProducerService";
import ProductService from "../services/ProductService";
import PriceService from "../services/PriceService";
import ParameterNameService from "../services/ParameterNameService";
import ParameterValueService from "../services/ParameterValueService";
import { Currency, Good, Parameter } from '../models';

module.exports.run = async () => {
    const zip = await unzipper.Open.url(request, global.gConfig.companies.dan.stores.main.url);
    await new Promise((resolve, reject) => {
        zip.files[0]
            .stream(global.gConfig.companies.dan.stores.main.pass)
            .pipe(fs.createWriteStream('./storage/dan_dealer.xls'))
            .on('error', reject)
            .on('finish', resolve)
    });
    console.log('downloading finish.');
    const company = await (new CompanyService()).getByAlias('dan');
    const store = _.find(company.stores, { is_main: true });
    const currency = await Currency.findOne({ where: { char_code: 'RUB' } });
    const case_ = await (new ParameterNameService()).getByAlias('case');
    const good_service = new GoodService();

    const workbook = XLSX.readFile('./storage/dan_dealer.xls');
    const sheet = workbook.Sheets[_.first(workbook.SheetNames)];
    const from_row = 3;
    const start = new Date();

    let product = {};
    let price = { min: 1, currency_id: currency.id };
    let good = { store_id: store.id };
    let ballance = 0;
    let remark = '';
    let case_value = undefined;

    for (let z in sheet) {
        if(z[0] === '!') continue;
        let { col, row, value } = getData(z, sheet);
        if (row < from_row) continue;
        switch (col) {
            case 'A':
                if (good.code) {
                    good = await good_service.firstOrNew(good);
                    if (good.isNewRecord) {
                        product = await (new ProductService()).updateOrCreate(product, { remark: remark });
                        good.set({ product_id: product.id, pack: 1, multiply: 1 });
                    }
                    good.set({ ballance: ballance, is_active: true });
                    await good_service.update(good);
                    if (case_value) {
                        case_value = await (new ParameterValueService()).updateOrCreate(
                            { name: case_value , parameter_name_id: case_.id }
                        );
                        await Parameter.findOrCreate({
                            where: { product_id: good.product_id, parameter_name_id: case_.id },
                            defaults: { parametr_value_id: case_value.id }
                        });
                    }
                    await (new PriceService()).updateOrCreate({ good_id: good.id }, price);
                    //clear values
                    product = {};
                    price = { min: 1, currency_id: currency.id };
                    good = { store_id: store.id };
                    ballance = 0;
                    remark = '';
                    case_value = undefined;
                }
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
                case_value = value;
                break;
            case 'F':
                const producer = await (new ProducerService())
                    .updateOrCreate({ name: value ? value : 'NONAME' });
                product.producer_id = producer.id;
                break;
            case 'H':
                price.our_price = value;
                price.for_all_price = value * 1.25;
                break;
            case 'I':
                ballance = value;
                price.max = value;
                break;
        }
    }
    Good.update(
        { is_active:  false, ballance: 0 },
        { where: { is_active: true, store_id: store.id, updated_at: { [Op.lt]: start }  } }
    );
};