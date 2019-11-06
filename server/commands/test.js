import CurrencyRateService from "../services/CurrencyRateService";

module.exports.run = async (args) => {
    const service = await CurrencyRateService.getNew();
    const start = new Date('2010-01-01');
    const end = new Date('2020-01-01');
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    const res = await service.getRatesByDate(date);
    console.log(res[0]);
};