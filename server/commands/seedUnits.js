'use strict';
import { Unit } from '../models';

module.exports.run = async () => {
    const units = [
        { where: { alias: 'm' }, defaults: { name: 'метр', divide: false, coeff: 1 } },
        { where: { alias: "mm" , base_unit_id: true }, defaults: { name: 'миллиметр', divide: true, coeff: 1000 } },
        { where: { alias: 'V' } , defaults: { name: 'вольт', divide: false, coeff: 1 } },
        { where: { alias: 'kV', base_unit_id: true } , defaults: { name: 'киловольт', divide: false, coeff: 1000 } }
    ];
    let u = undefined;
    for (let i = 0; i < units.length; i++) {
        if ( units[i].where.base_unit_id ) {
            units[i].where.base_unit_id = u.id;
        }
        u = await Unit.findOrCreate(units[i]);
        console.log(u, u.id);
    }
};