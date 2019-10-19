'use strict';

const fs = require('fs');
const unzipper = require('unzipper');
const XLSX = require('xlsx');
const request = require('request');
const _ = require('lodash');

import { getData } from "../services/getRowColInXlsX";

//const CompanyService = require('../services/CompanyService').default;

module.exports.run = async () => {
    const zip = await unzipper.Open.url(request, global.gConfig.companies.dan.stores.main.url);
    await new Promise((resolve, reject) => {
        zip.files[0]
            .stream(global.gConfig.companies.dan.stores.main.pass)
            .pipe(fs.createWriteStream('./storage/dan_dealer.xls'))
            .on('error', reject)
            .on('finish', resolve)
    });
    const workbook = XLSX.readFile('./storage/dan_dealer.xls');
    const sheet = workbook.Sheets[_.first(workbook.SheetNames)];
    const from_row = 3;
    //let product = {};
    let i = 0;
    for (let z in sheet) {
        if(z[0] === '!') continue;
        let { col, row, value } = getData(z, sheet);
        if (row < from_row) continue;
        /*switch (col) {
            case 'A':
                product
        }*/
        if (i++ === 40 || row === 4) break;
    }
};