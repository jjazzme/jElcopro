import ProducerService from "../services/ProducerService";

module.exports.run = async () => {
    const service = new ProducerService();
    const store = await service.find({ name: 'MAXIM' });
    console.log(store);
};