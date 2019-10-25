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
                online: true
            }
        }
    },
    compel: {
        inn: '7713005406',
        ogrn: '1027700032161',
        own: false,
        api_url: process.env.COMPEL_API_URL,
        api_hash: process.env.COMPEL_HASH,
        stores: {
            main: {
                name: 'CENTER',
                online: true,
                url: 'http://www.compel.ru/stockfiles2/0f3cf59278bb435da00616380f8805af/'
            }
        }
    }
}