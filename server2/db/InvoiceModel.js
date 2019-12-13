import Document from './DocumentModel';

export default class Invoice extends Document {
    transitions = [
        { name: 'reserve', from: 'formed', to: 'reserved' },
        { name: 'unreserve', from: 'reserved', to: 'formed' },
        { name: 'toWork', from: 'reserved', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'reserved' },
        { name: 'closeReserves', from: 'in_work', to: 'in_work' },
        { name: 'openReserves', from: 'in_work', to: 'in_work' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    /**
     * First variant close invoice reserves
     * @returns {Promise<void>}
     */
    async _closeReservesTransition() {
        const { DocumentLine, Reserve } = this.services.db.models;
        const reserves = await Reserve.findAll({
            where: { closed: false },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: this.id } },
            ],
        });
        await Promise.all(reserves.map((reserve) => reserve.update({ closed: true })));
        return true;
    }

    /**
     * First variant open invoice reserves
     * @returns {Promise<void>}
     */
    async _openReservesTransition() {
        const { DocumentLine, Reserve } = this.services.db.models;
        const reserves = await Reserve.findAll({
            where: { closed: true },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: this.id } },
            ],
        });
        await Promise.all(reserves.map((reserve) => reserve.update({ closed: false })));
        return true;
    }
}
