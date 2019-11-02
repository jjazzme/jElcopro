import InvoiceService from "../services/InvoiceService";


module.exports.run = async (args) => {
    const service = new InvoiceService();
    const res = await service.transition( 'toWork')
    console.log(res);
};