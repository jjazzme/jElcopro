import CompanyService from '../services/CompanyService';
import { InterStoreRoute } from '../models';

module.exports.run = async () => {
    const service = new CompanyService();
    // const promises = Object.keys(global.gConfig.companies).map((alias) => service.getByAlias(alias));
    // await Promise.all(promises);
    const compel = await service.getByAlias('compel');
    const dan = await service.getByAlias('dan');
    const elcopro = await service.getByAlias('elcopro');
    const promelec = await service.getByAlias('promelec');
    await InterStoreRoute.findOrCreate({
        where: { name: 'CENTER - 1905' },
        defaults: {
            from_store_id: compel.stores[0].id,
            to_store_id: elcopro.stores[0].id,
            minimum_days: 4,
            average_days: 6,
            maximum_days: 8,
            is_active: true,
        },
    });
    await InterStoreRoute.findOrCreate({
        where: { name: 'OMSK - 1905' },
        defaults: {
            from_store_id: dan.stores[0].id,
            to_store_id: elcopro.stores[0].id,
            minimum_days: 2,
            average_days: 4,
            maximum_days: 6,
            is_active: true,
        },
    });
    await InterStoreRoute.findOrCreate({
        where: { name: 'EKB - 1905' },
        defaults: {
            from_store_id: promelec.stores[0].id,
            to_store_id: elcopro.stores[0].id,
            minimum_days: 6,
            average_days: 8,
            maximum_days: 10,
            is_active: true,
        },
    });
};
