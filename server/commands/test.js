const Service = require('../services/ProductService').default;
module.exports.run = async () => {
    const item = await Service.updateOrCreate({
        name: 'MAX232CPE+ Очень rhenfz', vat: 20, producer_id:3, right_product_id:1
    });
    console.dir(item.dataValues);
};