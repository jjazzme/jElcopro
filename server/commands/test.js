import ProducerService from "../services/ProducerService";
import XLSX from 'xlsx';
import _ from 'lodash'

module.exports.run = async () => {
    const workbook = XLSX.readFile('./storage/COMPELDISTI3_ext_TI.dbf');
    const sheet = workbook.Sheets[_.first(workbook.SheetNames)];
    console.log(sheet);
};