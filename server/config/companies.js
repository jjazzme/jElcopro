require('dotenv').config();

export default {
    dan: {
        inn: '5503012474',
        ogrn: '1025500755587',
        own: false,
        stores: {
            main: {
                name: 'Склад компании Дан',
                online: false,
                url: 'http://danomsk.ru/upload/dan_dealer.zip',
                pass: 'dandealer000'
            }
        }
    },
    elcopro: {
        inn: '7017364619',
        ogrn: '1147017021876',
        own: true,
        stores: {
            main: {
                name: 'Склад на 1905',
                online: false
            }
        }
    },
    compel: {
        inn: '7713005406',
        ogrn: '1027700032161',
        own: false,
        cache_time: 900,
        service: 'CompelService',
        api_url: process.env.COMPEL_API_URL,
        api_hash: process.env.COMPEL_HASH,
        stores: {
            main: {
                name: 'CENTER',
                online: true,
                url: 'http://www.compel.ru/stockfiles2/0f3cf59278bb435da00616380f8805af/',
                days: 6
            }
        }
    },
    promelec: {
        inn: '6659197470',
        ogrn: '1096659012317',
        own: false,
        cache_time: 900,
        service: 'PromelecService',
        api_url: process.env.PROM_URL,
        api_login: process.env.PROM_LOGIN,
        api_pass: process.env.PROM_PASS,
        api_client_id: process.env.PROM_ID,
        stores: {
            main: {
                name: 'Склад ЕКБ',
                online: true,
                days: 8
            }
        }
    }
}