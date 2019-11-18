const _ = require('lodash');
const templates = require('../modules/templates');
const models = require('../models');

module.exports = {
     controllerPermissionIsDenied({clientUserID: clientUserID, model: model, id: id, column: column, requiredPermissons:requiredPermissons}){
        // requiredPermissons = ['Read', 'Update'...]
        if (this.getUserID !== parseInt(clientUserID)) return true;

        const currentPermissions = this.getPermission({model,id,column});
        let ret = null;
        _.forEach(requiredPermissons, (name)=>{
            if (currentPermissions[name] === false) ret = false;
            else if (ret!==false && currentPermissions[name] === true) ret = true;
        });
        return !ret
    },
    getPermission({model: model, id: id, column: column}){
        let permission = _.cloneDeep(templates.permission);
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
    },
    getModelPermissions(model, data){
      let ret = {model: _.cloneDeep(templates.permission), rows: [], columns: []};


      return ret;
    },
    permissionsModelFilter(model, data){
        return data
    },
    permissionsShellFilter(model, shell){
        return shell
    },
    /**
     * @param {Number | null} id
     * @returns {Promise<Model | null> | Promise<Model>}
     */
    getUser(id){return models.User.findByPk(id ?? 1)},
    get getUserID(){return 1}
}