import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import uuid from 'uuid/v4';
import oauth2orize from 'oauth2orize';

export default class Auth {
    constructor(express, db) {
        this.express = express;
        this.db = db;
        this.bearer = passport.authenticate('bearer', { session: false });
    }

    async authorize() {
        this.user = await this.db.models.User.findByPk(1);
        return true;
    }

    init() {
        const { AccessToken, User } = this.db.models;
        this.express.use(passport.initialize());
        passport.use(new BearerStrategy(async (accessToken, done) => {
            const token = await AccessToken.findByPk(accessToken);
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
        const server = oauth2orize.createServer();
        server.exchange(oauth2orize.exchange.password(async (client, username, password, scope, done) => {
            const user = await User.getInstance({ email: username });
            if (!user) return done(null, false);
            if (!user.comparePassword(password)) return done(null, false);
            const token = uuid();
            const now = new Date();
            // await AccessToken.update({ revoked: true }, { userId: user.id });
            await AccessToken.create({
                id: token,
                userId: user.id,
                expiredAt: now.setFullYear(now.getFullYear() + 1),
            });
            return done(null, token, { expires_in: now.setFullYear(now.getFullYear() + 1) });
        }));
        this.express.post('/api/auth/login', server.token(), server.errorHandler());
        this.express.get('/api/auth/logout', this.bearer, async (req, res) => {
            const token = req.headers.authorization.split(' ')[1];
            await AccessToken.update({ revoked: true }, { where: { id: token } });
            res.send({ message: 'Logout successfull' });
        });
    }
}
