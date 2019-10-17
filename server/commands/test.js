const dadata = require('../services/dadata').dadata

module.exports.run = (args) => {
    console.log(dadata.query('last'))
}