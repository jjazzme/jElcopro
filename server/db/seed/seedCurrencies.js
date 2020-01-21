import axios from 'axios';
import { parseString } from 'xml2js';
import iconv from 'iconv-lite';
import app from '../../index';

const { Currency } = app.services.db.models;

module.exports.run = async () => {
    const response = await axios.get(
        'http://www.cbr.ru/scripts/XML_daily.asp', { responseType: 'arraybuffer' },
    );
    const xml = iconv.decode(Buffer.from(response.data), 'win1251');
    parseString(xml, (err, res) => {
        res.ValCurs.Valute.forEach((value) => {
            // console.log(value);
            Currency.findOrCreate({
                where: { id: value.$.ID },
                defaults: {
                    num_code: value.NumCode[0],
                    char_code: value.CharCode[0],
                    // eslint-disable-next-line radix
                    nominal: parseInt(value.Nominal[0]),
                    name: value.Name[0],
                },
            });
        });
    });
    Currency.findOrCreate({
        where: { id: 'R01000' },
        defaults: {
            num_code: '643', char_code: 'RUB', nominal: 1, name: 'Российский рубль',
        },
    });
};
