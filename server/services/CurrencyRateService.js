import axios from 'axios';
import iconv from 'iconv-lite';
import { parseString } from 'xml2js';
import moment from 'moment';

export default class CurrencyRateService {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }

    /**
     * Get XML from CBR
     * @param {Date|string} date
     * @returns {Promise<*>}
     * @private
     */
    // eslint-disable-next-line class-methods-use-this
    async _getXMLfromCBR(date) {
        const u = `http://www.cbr.ru/scripts/XML_daily.asp?date_req=${moment(date).format('DD.MM.YYYY')}`;
        const response = await axios.get(u, { responseType: 'arraybuffer' });
        return iconv.decode(Buffer.from(response.data), 'win1251');
    }

    /**
     * Syncronize with CBR
     * @param {Date|string} date
     * @returns {Promise<void>}
     */
    async synchronizeWithCBR(date) {
        const { Currency, CurrencyRate } = this.db.models;
        const xml = await this._getXMLfromCBR(date);
        return new Promise((resolve, reject) => {
            parseString(xml, async (err, res) => {
                if (err) reject(err);
                try {
                    const updates = res.ValCurs.Valute.map(async (value) => {
                        await Currency.getInstanceOrCreate(
                            { id: value.$.ID },
                            {
                                num_code: value.NumCode[0],
                                char_code: value.CharCode[0],
                                // eslint-disable-next-line radix
                                nominal: parseInt(value.Nominal[0]),
                                name: value.Name[0],
                            },
                        );
                        return CurrencyRate.getInstanceOrCreate(
                            { currency_id: value.$.ID, date },
                            { rate: value.Value[0].replace(',', '.') },
                        );
                    });
                    updates.push(
                        CurrencyRate.getInstanceOrCreate({ currency_id: 'R01000', date }, { rate: 1 }),
                    );
                    Promise.all(updates).then(() => resolve(true));
                } catch (e) {
                    this.logger.error(e);
                    reject(e);
                }
            });
        });
    }

    /**
     * Get currency rates by need date
     * @param {Date|string} date
     * @returns {Promise<Array>}
     */
    async getRatesByDate(date) {
        const { CurrencyRate } = this.db.models;
        let rates = await CurrencyRate.findAll({ where: { date } });
        if (rates.length === 0) {
            await this.synchronizeWithCBR(date);
            rates = await CurrencyRate.findAll({ where: { date } });
            if (rates.length === 0) {
                const lastDate = await CurrencyRate.findOne({ order: [['date', 'DESC']] });
                rates = await CurrencyRate.findAll({ where: { date: lastDate.date } });
            }
        }
        return rates;
    }

    async default() {
        return this.getRatesByDate(Date.now());
    }
}
