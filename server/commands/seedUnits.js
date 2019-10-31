'use strict';
import UnitService from "../services/UnitService";

module.exports.run = async () => {
    const units = [
        { where: { alias: 'm' }, defaults: { name: 'метр', divide: false, coeff: 1 } },
        { where: { alias: "mm" , base_unit_id: true }, defaults: { name: 'миллиметр', divide: true, coeff: 1000 } },
        { where: { alias: 'V' } , defaults: { name: 'вольт', divide: false, coeff: 1 } },
        { where: { alias: 'kV', base_unit_id: true } , defaults: { name: 'киловольт', divide: false, coeff: 1000 } }
    ];
    const service = new UnitService();
    let unit = undefined;
    for (let i = 0; i < units.length; i++) {
        if ( units[i].where.base_unit_id ) {
            units[i].where.base_unit_id = unit.id;
        }
        unit = await service.updateOrCreate(units[i].where, units[i].defaults)
    }
};