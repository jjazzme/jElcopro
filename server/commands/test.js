import ProducerService from "../services/ProducerService";
import XLSX from 'xlsx';

module.exports.run = async () => {
    const workbook = XLSX.readFile('./storage/dan_dealer.xls');
    const sheet = workbook.Sheets[_.first(workbook.SheetNames)];

};