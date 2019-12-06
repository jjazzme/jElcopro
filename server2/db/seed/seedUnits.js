import app from '../../index';

const { Unit } = app.services.db.models;

module.exports.run = async () => {
    const units = [
        { where: { alias: 'm' }, defaults: { name: 'метр', divide: false, coeff: 1 } },
        { where: { alias: 'mm', base_unit_id: true }, defaults: { name: 'миллиметр', divide: true, coeff: 1000 } },
        { where: { alias: 'V' }, defaults: { name: 'вольт', divide: false, coeff: 1 } },
        { where: { alias: 'kV', base_unit_id: true }, defaults: { name: 'киловольт', divide: false, coeff: 1000 } },
    ];
    let unit = null;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < units.length; i++) {
        if (units[i].where.base_unit_id) {
            units[i].where.base_unit_id = unit.id;
        }
        [unit] = await Unit.findOrCreate(units[i]);
    }
};
