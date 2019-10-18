const PartyService = require('../services/PartyService').default;
const CompanyService = require('../services/CompanyService').default;
module.exports.run = (args) => {
    //PartyService.fromDadata(args.i)
    CompanyService.makeCompanyWithStore(args.i, '1147017021876', '')
};