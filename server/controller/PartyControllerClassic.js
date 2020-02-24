export default class PartyControllerClassic {
    constructor(services) {
        this.services = services;
    }

    async index(req) {
        const search = JSON.parse(req.query.filters).name;
        if (search.length < 3) return [];
        const key = `party_${search}`;
        if (await this.services.cache.has(key)) return this.services.cache.get(key);
        const parties = await this.services.dadata.query('party', search);
        const answer = {
            rows: await Promise.all(parties.suggestions.map(
                (party) => this.services.db.models.Party.getInstanceOrCreate(
                    { inn: party.data.inn, ogrn: party.data.ogrn },
                    { name: party.value, json: party },
                ),
            )),
        };
        return this.services.cache.put(key, answer, 1440);
    }
}
