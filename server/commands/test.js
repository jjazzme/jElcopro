const CompanyService = require('../services/CompanyService').default;
const ProducerService = require('../services/ProducerService').default;
module.exports.run = async (args) => {
    const producer = await ProducerService.updateOrCreate({name: 'TI', right_producer_id: null })
    console.dir(producer.changed());
};