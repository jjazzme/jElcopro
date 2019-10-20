
import Service from "../services/ProductService";
module.exports.run = async () => {
    const service = await new Service();
    const s = await service.updateOrCreate({ name: 'КР122ЕН5'}, { vat: 20 });
    console.log(s.dataValues);
};