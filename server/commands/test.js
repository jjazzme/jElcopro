import CompanyService from "../services/CompanyService";
module.exports.run = async () => {
    const service = await new CompanyService();
    const s = await service.getByAlias('elcopro');
    //const s = await service.update({ id:7, name: 'TEST3' , producer_id: undefined })
    console.log(s);

};