export default (Express) => {
    const router = Express.Router();
    // eslint-disable-next-line no-unused-vars
    router.get('/:id?', (req, res) => {
        res.render('index');
    });
    return router;
};
