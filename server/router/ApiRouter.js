import _ from 'lodash';
import Express from 'express';

export default class ApiRouter {
    constructor(db) {
        this.router = Express.Router();
        this.db = db;
    }

    resource(path, Controller, args = []) {
        const middlewares = _.union(_.isArray(args) ? args : [args], this.middlewares);
        middlewares.forEach((middleware) => this.router.use(`/${path}/:id`, middleware));
        const controller = typeof Controller === 'function' ? new Controller(this.db) : Controller;

        this.router.get(`/${path}/:id`, async (req, res, next) => {
            try {
                res.send(await controller.get(req, res));
            } catch (e) {
                next(e);
            }
        });
        this.router.put(`/${path}`, async (req, res, next) => {
            try {
                res.send(await controller.index(req, res));
            } catch (e) {
                next(e);
            }
        });
        this.router.post(`/${path}/:id?`, async (req, res, next) => {
            try {
                res.send(await controller.modify(req, res));
            } catch (e) {
                next(e);
            }
        });
        this.router.delete(`/${path}/:id`, async (req, res, next) => {
            try {
                res.send(await controller.destroy(req, res));
            } catch (e) {
                next(e);
            }
        });
    }

    middleware(...args) {
        this.middlewares = args;
    }
}
