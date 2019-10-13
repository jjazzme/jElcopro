const enums = require('../modules/enums');
const templates = require('../modules/templates')
const _ = require('lodash');

module.exports = {
    controllerPermissionIsDenied({clientUserID: clientUserID, model: model, id: id, column: column, requiredPermissons:requiredPermissons}){
        // requiredPermissons = ['Read', 'Update'...]
        const user = this.getUser();
        if (user.id !== parseInt(clientUserID)) return true;

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
        const user = this.getUser();
        if (user.id) {
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
    getUser() {return {id: 1, name: 'Администратор'} },
    permissionsModelFilter(model, data){
        return data
    },
    permissionsShellFilter(model, shell){
        return shell
    },
};