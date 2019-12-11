import App from './App';
import services from './services';

const app = new App(services());

app.start();

// app.services.prices.searchByNameOnStore({ name: 'aaaaa', from_store: 2 })

export default app;
