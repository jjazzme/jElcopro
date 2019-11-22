export default (Express) => {
    const router = Express.Router();
    // eslint-disable-next-line no-unused-vars
    router.get('/', (req, res, next) => { res.render('index'); });
    return router;
};
