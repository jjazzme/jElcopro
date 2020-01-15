import ApiController from './ApiController';

export default class DocumentLineController extends ApiController {
    constructor(db) {
        super(db.models.DocumentLine);
    }

    async modify(req) {
        const { documentId, priceLine, ourPrice } = req.body; // order = true
        if (priceLine && documentId && ourPrice) {
            const price = ourPrice ? priceLine.our_price : priceLine.for_all_price;
            return this.Model.create({
                document_id: documentId,
                good_id: priceLine.good_id,
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
        return super.modify(req);
    }
}
