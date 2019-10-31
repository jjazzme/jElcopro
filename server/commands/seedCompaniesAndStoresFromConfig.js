'use strict';

import CompanyService from "../services/CompanyService";

module.exports.run = async () => {
    const service = new CompanyService();
    Object.keys(global.gConfig.companies).forEach(async alias => await service.getByAlias(alias) );
};