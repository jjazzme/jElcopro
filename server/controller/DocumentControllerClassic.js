import ApiController from './ApiControllerClassic';

export default class DocumentController extends ApiController {
    scopes = [
        'withSum',
        'withBuyerable',
        'withSellerable',
        'withStore',
        'withForeignStore',
        'withCurrency',
        'withDocumentLines',
        'withUser',
        'defaultScope',
        'withChildren',
        'withParent',
    ];

    async create(req) {
        if (req.body.parent_id) {
            // need use req as request in options
            const user = await this.Model.services.db.models.User.findByPk(1);
            const optics = { parent_id: req.body.parent_id, user };
            return this.Model.createFromOptics(optics);
        }
        return super.create(req);
    }
}
