import App from './App';
import services from './services';

const app = new App(services());

app.start();

/*
app.services.db.connection.transaction(async (t) => {
    await app.services.auth.authorize();
    app.services.db.models.Order.createFromOptics({ sellerable_id: 1, buyerable_id: 2 });
});
*/

export default app;
