import app from '../../index';

const { DocumentType } = app.services.db.models;

module.exports.run = async () => {
    const types = [
        { id: 'check', name: 'Чек' },
        { id: 'defective', name: 'Списание' },
        { id: 'invoice', name: 'Счет' },
        { id: 'list', name: 'Список' },
        { id: 'movement', name: 'Перемещение' },
        { id: 'order', name: 'Заказ' },
        { id: 'transfer-in', name: 'УПД от поставщика' },
        { id: 'transfer-out', name: 'УПД для покупателя' },
        { id: 'transfer-in-corrective', name: 'Корректировочная УПД oт покупателя' },
        { id: 'transfer-out-corrective', name: 'Корректировочная УПД для поставщика' },
    ];
    types.forEach((value) => {
        DocumentType.findOrCreate({ where: { id: value.id }, defaults: { name: value.name } });
    });
};
