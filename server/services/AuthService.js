import _ from 'lodash';
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

    // ???
    templates = {
        permission: Object.freeze({
            Create: null, Read: null, Update: null, Delete: null,
        }),
        modelRowPermission: Object.freeze({}),
    };

    // ???
    enums = {
        authType: Object.freeze({
            Create: 'Create', Read: 'Read', Update: 'Update', Delete: 'Delete',
        }),
    };

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
            this.user = await token.getUser();
            return done(null, this.user, { scope: '*' });
        }));
        const server = oauth2orize.createServer();
        server.exchange(oauth2orize.exchange.password(async (client, username, password, scope, done) => {
            const user = await User.scope('withPassword').findOne({ where: { email: username } });
            if (!user) return done(null, false);
            const isPassEqual = user.comparePassword(password);
            if (!isPassEqual) return done(null, false);
            const token = uuid();
            const now = new Date();
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

    controllerPermissionIsDenied({
        clientUserID, model, id, column, requiredPermissons,
    }) {
        // requiredPermissons = ['Read', 'Update'...]
        if (this.getUserID !== parseInt(clientUserID, 0)) return true;

        const currentPermissions = this.getPermission({ model, id, column });
        let ret = null;
        _.forEach(requiredPermissons, (name) => {
            if (currentPermissions[name] === false) ret = false;
            else if (ret !== false && currentPermissions[name] === true) ret = true;
        });
        return !ret;
    }

    getPermission() {
        const permission = _.cloneDeep(this.templates.permission);
        if (this.getUserID) {
            permission.Create = true;
            permission.Read = true;
            permission.Update = true;
            permission.Delete = true;
        } else {
            permission.Create = false;
            permission.Read = false;
            permission.Update = false;
            permission.Delete = false;
        }
        return permission;
    }

    getModelPermissions() {
        return { model: _.cloneDeep(this.templates.permission), rows: [], columns: [] };
    }

    // eslint-disable-next-line class-methods-use-this
    permissionsModelFilter(model, data) {
        return data;
    }

    // eslint-disable-next-line class-methods-use-this
    permissionsShellFilter(model, shell) {
        return shell;
    }
}
