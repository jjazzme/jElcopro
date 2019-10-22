import StoreService from "../services/CompanyService";

module.exports.run = async () => {
    const service = new StoreService();
    const store = await service.getByAlias('dan');
    console.log(store);
};