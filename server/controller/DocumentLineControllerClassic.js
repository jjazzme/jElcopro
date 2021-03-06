import ApiController from './ApiControllerClassic';

export default class DocumentLineController extends ApiController {
    constructor(db) {
        super(db.models.DocumentLine);
    }

    scopes = [
        'withGood',
    ];

    async create(req) {
        const { documentId, priceLine, ourPrice } = req.body;
        if (priceLine && documentId) {
            const price = ourPrice ? priceLine.price : priceLine.for_all_price_rub;
            return this.Model.create({
                document_id: documentId,
                good_id: priceLine.good_id,
                // eslint-disable-next-line no-underscore-dangle
                quantity: priceLine.quantity,
                vat: priceLine.vat,
                price_without_vat: (price / (100 + priceLine.vat)) * 100,
                price_with_vat: price,
                // eslint-disable-next-line no-underscore-dangle
                amount_without_vat: (price / (100 + priceLine.vat)) * 100 * priceLine._realCount,
                // eslint-disable-next-line no-underscore-dangle
                amount_with_vat: price * priceLine._realCount,
                times: priceLine.average_days,
            });
        }
        return super.create(req);
    }
}
