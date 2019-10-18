const CompanyService = require('../services/CompanyService').default;

module.exports.run = async (args) => {
    const company = await CompanyService.getByAlias(args.i);
    console.dir(company);
};