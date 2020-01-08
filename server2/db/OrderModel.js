import Document from './DocumentModel';

export default class Order extends Document {
    transitions = [
        { name: 'toWork', from: 'formed', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'formed' },
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
