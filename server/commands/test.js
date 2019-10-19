import Service from "../services/ProductService";
module.exports.run = async () => {
    const service = new Service();
    const item = await service.updateOrCreate({
        name: 'MAX3232CPE+', vat: 20, producer_id: 3, remark: 'Мелкосхема'
    });

    console.dir(item.dataValues);
};