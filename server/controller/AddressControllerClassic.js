import DadataControllerClassic from './DadataControllerClassic';

export default class AddressControllerClassic extends DadataControllerClassic {
    constructor(services) {
        super(services, 'address');
    }

    address(address) {
        return this.services.db.models.Address.getInstanceOrCreate(
            { address: address.unrestricted_value },
            { json: address },
        );
    }
}
