const dadata = require('../services/dadata').default;

module.exports.run = (args) => {
    console.log(args);
    dadata.query('fio', 'Ласт')
        .then(res => console.log(res))
        .catch(e => console.log(e))
};