const dadata = require('../services/dadata')

module.exports.run = (args) => {
    console.log(dadata.query('last'))
}