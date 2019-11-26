export default class Auth {
    constructor(express, db) {
        this.express = express;
        this.db = db;
    }

    async authorize() {
        this.user = await this.db.models.User.findByPk(1);
        return true;
    }
}
