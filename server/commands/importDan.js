'use strict';

const fs = require('fs');
const unzipper = require('unzipper');
const XLSX = require('xlsx');
const request = require('request');
const _ = require('lodash');

import { getData } from "../services/getRowColInXlsX";

import GoodService from "../services/GoodService";
import CompanyService from "../services/CompanyService";
import ProducerService from "../services/ProducerService";
import ProductService from "../services/ProductService";
import { Currency } from '../models';

module.exports.run = async () => {
    const zip = await unzipper.Open.url(request, global.gConfig.companies.dan.stores.main.url);
    await new Promise((resolve, reject) => {
        zip.files[0]
            .stream(global.gConfig.companies.dan.stores.main.pass)
            .pipe(fs.createWriteStream('./storage/dan_dealer.xls'))
            .on('error', reject)
            .on('finish', resolve)
    });

    const company = await (new CompanyService()).getByAlias('dan');
    const store = _.find(company.stores, { is_main: true });
    const currency = Currency.findOne({ where: { char_code: 'RUB' } });
    const good_service = new GoodService();

    const workbook = XLSX.readFile('./storage/dan_dealer.xls');
    const sheet = workbook.Sheets[_.first(workbook.SheetNames)];
    const from_row = 3;
    const start = new Date();

    let product = {};
    let price = { min: 1 };
    let good = { store_id: store.id };
    let ballance = 0;
    let remark = '';

    for (let z in sheet) {
        if(z[0] === '!') continue;
        let { col, row, value } = getData(z, sheet);
        if (row < from_row) continue;
        switch (col) {
            case 'A':
                if (good.code) {
                    good = await good_service.find(good);
                    if (good.isNewRecord) {
                        product = await (new ProductService()).updateOrCreate(product, { remark: remark });
                        good.set({ product_id: product.id, pack: 1, multiply: 1, is_active: 1 });
                    }
                    good.set({ ballance: ballance });
                    await good_service.update(good);



                    product = {};
                    price = { min: 1 };
                    good = { store_id: store.id };
                    ballance = 0;
                    remark = '';
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
            case 'F':
                const producer = await (new ProducerService())
                    .updateOrCreate({ name: value ? value : 'NONAME' });
                product.producer_id = producer.id;
                break;
            case 'H':
                price.our_price = value;
                price.for_all_price = value * 1.25;
            case 'I':
                ballance = value;
                break;
        }
    }
};