import app from '../../index';

// const { companies } = app.services.config;
const { Company, InterStoreRoute } = app.services.db.models;

module.exports.run = async () => {
    // const promises = Object.keys(companies).map((alias) => Company.getByAlias(alias));
    // await Promise.all(promises);
    const compel = await Company.getByAlias('compel');
    const dan = await Company.getByAlias('dan');
    const elcopro = await Company.getByAlias('elcopro');
    const promelec = await Company.getByAlias('promelec');
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
