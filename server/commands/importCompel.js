'use strict';

import axios from 'axios';
import fs from 'fs';
import unzipper from 'unzipper';

import XLSX from 'xlsx';
import { getData } from "../services/getRowColInXlsX";
import _ from 'lodash';
import { Currency, Parameter, Price } from "../models";
import CompanyService from "../services/CompanyService";
import ParameterNameService from "../services/ParameterNameService";
import GoodService from "../services/GoodService";
import ProducerService from "../services/ProducerService";
import ProductService from "../services/ProductService";
import ParameterValueService from "../services/ParameterValueService";

module.exports.run = async () => {
    const start = new Date();

    const response = await axios.get(global.gConfig.companies.compel.stores.main.url, { responseType: 'arraybuffer' });
    const file = await fs.createWriteStream('./storage/COMPELDISTI3_ext_TI.dbf');
    const directory = await unzipper.Open.buffer(response.data);
    await directory.files[0].stream().pipe(file);

    console.log('downloading finish.');

    const workbook = await XLSX.readFile('./storage/COMPELDISTI3_ext_TI.dbf');
    const sheet = await workbook.Sheets[_.first(workbook.SheetNames)];

    const from_row = 2;
    const company = await (new CompanyService()).getByAlias('compel');
    const store = _.find(company.stores, { is_main: true });
    const currency = await Currency.findOne({ where: { char_code: 'USD' } });
    const case_ = await (new ParameterNameService()).getByAlias('case');
    const good_service = new GoodService();

    let product = {};
    let price = [];
    let cost = 0;
    let good = { store_id: store.id };
    let good_additional = {};
    let ballance = 0;
    let case_value = undefined;
    console.log(workbook);
    for (let z in sheet) {
        console.log('after');
        if (z[0] === '!') continue;
        let {col, row, value} = getData(z, sheet);
        if (row < from_row) continue;
        switch (col) {
            case 'A':
                good.code = value;
                break;
            case 'C':
                product.name = value;
                break;
            case 'D':
                const producer = await (new ProducerService())
                    .updateOrCreate({ name: value ? value : 'NONAME' });
                product.producer_id = producer.id;
                break;
            case 'E':
                good_additional.pack = value;
                break;
            case 'G':
                ballance = value;
                break;
            case 'R':
                case_value = value;
                break;
            case 'X':
                good_additional.multiply = value == 0 ? 1 : good_additional.pack;
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
                if (cost != 0) {
                    price.push({
                        min: value == 0 ? 1 : value,
                        our_price: cost,
                        for_all_price: 0,
                        currency_id: currency.id
                    });
                    cost = 0;
                }
                break;
            case 'AB':
                good = await good_service.firstOrNew(good);
                if (good.isNewRecord) {
                    product = await (new ProductService()).updateOrCreate(product);
                    good_additional.product_id = product.id;
                    good.set(good_additional);
                }
                good.set({ ballance: ballance, is_active: true });
                good.changed('updatedAt', true);
                good = await good_service.update(good);
                if (case_value) {
                    case_value = await (new ParameterValueService()).updateOrCreate(
                        { name: case_value , parameter_name_id: case_.id }
                    );
                    await Parameter.findOrCreate({
                        where: { product_id: good.product_id, parameter_name_id: case_.id },
                        defaults: { parameter_value_id: case_value.id }
                    });
                }
                for (let i = 0; i < price.length; i++) {
                    if ( i == price.length - 1 ) {
                        price[i].max = ballance
                    } else if ( i > 0 ) {
                        price[i - 1].max = price[i].min - 1;
                    }
                    price.good_id = good.id;
                }
                await Price.destroy({ where: { good_id: good.id}});
                await Price.bulkCreate(price);

                product = {};
                price = [];
                cost = 0;
                good = { store_id: store.id };
                good_additional = {};
                ballance = 0;
                case_value = undefined;

                break;
        }
    }
    const d = await good_service.disactivate(store.id, start);
    console.log(d);
};