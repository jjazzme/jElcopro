const PartyService = require('../services/PartyService').default;

module.exports.run = (args) => {
    PartyService.fromDadata(args.i)
};