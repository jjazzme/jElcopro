import DadataControllerClassic from './DadataControllerClassic';

export default class PartyControllerClassic extends DadataControllerClassic {
    constructor(services) {
        super(services, 'party');
    }

    async party(party) {
        return this.services.db.models.Party.getInstanceOrCreate(
            { inn: party.data.inn, ogrn: party.data.ogrn },
            { name: party.value, json: party },
        );
    }
}
