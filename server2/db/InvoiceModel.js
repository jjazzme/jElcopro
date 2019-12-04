import Document from './DocumentModel';

export default class Invoice extends Document {
    transitions = [
        { name: 'reserve', from: 'formed', to: 'reserved' },
        { name: 'unreserve', from: 'reserved', to: 'formed' },
        { name: 'toWork', from: 'reserved', to: 'in_work' },
        { name: 'unWork', from: 'in_work', to: 'reserved' },
        { name: 'close', from: 'in_work', to: 'closed' },
    ];

    /**
     * Transition 'reserve' try to reserve document lines
     * @param {Object} params
     * @param {boolean} params.own - Reserve only goods that was from our store
     * @returns {Promise<unknown>}
     * @private
     */
    async _reserveTransition(params) {
        let reserved = 0;
        const lines = await this.getDocumentLines({ scope: ['withFutureReserve'] });
        // eslint-disable-next-line no-restricted-syntax,no-unused-vars
        for (const line of lines) {
            // eslint-disable-next-line no-await-in-loop
            reserved += await line.reserve(params);
        }
        return reserved;
    }

    /**
     * Transition 'unreserve' try to unreserve document lines
     * @param {Object} params
     * @returns {Promise<number>}
     * @private
     */
    // eslint-disable-next-line no-unused-vars
    async _unreserveTransition(params) {
        let unreserved = 0;
        const lines = await this.getDocumentLines({ scope: ['withFutureReserve', 'withReserves'] });
        // eslint-disable-next-line no-restricted-syntax,no-unused-vars
        for (const line of lines) {
            // eslint-disable-next-line no-await-in-loop
            unreserved += await line.unreserve();
        }
        return unreserved;
    }

    // eslint-disable-next-line class-methods-use-this
    async _toWorkTransition() {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    async _unWorkTransition() {
        return true;
    }

    /**
     * First variant close invoice reserves
     * @param {Sequelize.Transaction=} transaction
     * @returns {Promise<void>}
     */
    async closeReserves(transaction) {
        if (this.status_id !== 'in_work') throw new Error('Счет должен быть в работе');
        const { DocumentLine, Reserve } = this.services.db.models;
        const reserves = await Reserve.findAll({
            where: { closed: false },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: this.id } },
            ],
        });
        if (transaction) {
            await Promise.all(reserves.map((reserve) => reserve.update({ closed: true })));
        } else {
            await this.services.dbConnection.transaction(async () => {
                await Promise.all(reserves.map((reserve) => reserve.update({ closed: true })));
            });
        }
    }

    /**
     * First variant open invoice reserves
     * @param {Sequelize.Transaction=} transaction
     * @returns {Promise<void>}
     */
    async openReserves(transaction) {
        if (this.status_id !== 'in_work') throw new Error('Счет должен быть в работе');
        const { DocumentLine, Reserve } = this.services.db.models;
        const reserves = await Reserve.findAll({
            where: { closed: true },
            include: [
                { model: DocumentLine, as: 'documentLine', where: { document_id: this.id } },
            ],
        });
        if (transaction) {
            await Promise.all(reserves.map((reserve) => reserve.update({ closed: false })));
        } else {
            await this.services.dbConnection.transaction(async () => {
                await Promise.all(reserves.map((reserve) => reserve.update({ closed: false })));
            });
        }
    }
}
