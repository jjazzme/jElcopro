import passport from 'passport';
import BearerStrategy from 'passport-http-bearer';
import bcrypt from 'bcrypt';

export default class Auth {
    constructor(express, db) {
        this.express = express;
        this.db = db;
    }

    async authorize() {
        this.user = await this.db.models.User.findByPk(1);
        return true;
    }

    init() {
        passport.use(new BearerStrategy(async (accessToken, done) => {
            const { AccessToken } = this.db.models;
            const token = await AccessToken.findByPk(bcrypt.hashSync(accessToken, bcrypt.genSaltSync()));
            if (!token) {
                return done(null, false);
            }
            if (token.revoked) {
                return done(null, false, { message: 'Token revoked' });
            }
            if (new Date() > token.expiredAt) {
                await token.update({ revoked: true });
                return done(null, false, { message: 'Token expired' });
            }
            return done(null, token.user, { scope: '*' });
        }));
    }
}
