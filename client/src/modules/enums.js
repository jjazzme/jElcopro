'use strict';

export default class Enums {
    constructor(){}
    get loadingStatus() {
        return Object.freeze({None:-10, Begin:0, Authenticated: 10, ShellLoaded:20, TableLoading:30, TableLoaded:40, TablePreDisplayed:50, TableDisplayed:60, TableSaved: 70});
    }
    get permission() { return Object.freeze({Create: 'Create', Read: 'Read', Update: 'Update', Delete: 'Delete'})}
    get editorTypes() { return Object.freeze({String: 'string', Selector: 'selector'})}
}
/*
module.enums = {
    LoadingStatus: ()=>Object.freeze({None:-10, Begin:0, Authenticated: 10, ShellLoaded:20, TableLoading:30, TableLoaded:40, TablePreDisplayed:50, TableDisplayed:60, TableSaved: 70}),
    Permission: ()=>Object.freeze({Create:'Create',Read:'Read',Update:'Update',Delete:'Delete'}),
};
*/
