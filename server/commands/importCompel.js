'use strict';

import axios from 'axios';
import fs from 'fs';
import unzipper from 'unzipper';

import XLSX from 'xlsx';
import { getData } from "../services/getRowColInXlsX";
import _ from 'lodash';

module.exports.run = async () => {
    const response = await axios.get(global.gConfig.companies.compel.stores.main.url, { responseType: 'arraybuffer' });
    const file = await fs.createWriteStream('./storage/COMPELDISTI3_ext_TI.dbf');
    const directory = await unzipper.Open.buffer(response.data);
    await directory.files[0].stream().pipe(file);

    console.log('downloading finish.');

    const workbook = XLSX.readFile('./storage/COMPELDISTI3_ext_TI.dbf');
    const sheet = workbook.Sheets[_.first(workbook.SheetNames)];
    let from_row = 3;
    const start = new Date();

    for (let z in sheet) {
        if (z[0] === '!') continue;
        let {col, row, value} = getData(z, sheet);
        console.log(col, row, value);
        if (from_row++ == 130) break;
    }
};