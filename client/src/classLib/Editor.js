'use strict';

import Utils from "@/classLib/Utils";
import Vue from 'vue';
import store from '../store/_default';

export class FieldEditor {
    /**
     *
     * @param obj
     * @param table
     */
    constructor(obj, table, store) {
        this.Utils = new Utils();
        this.obj = obj;
        this.table = table;
        this.target = $($(obj.target ? obj.target : obj).closest('div.v-t-col')[0]).children('span')[0];
        this.parent = $(this.target).parent();
        this.props = {
            selector:{
                options: null,
                selected: null
            }
        };
        this.$store = store;
    }


    get column() {
        return $(this.target).attr('data-column');
    }
    get columnClass(){

        return alias;
    }
    get dataValue() {
        return _.find(this.table.data, item=>item.id==this.id)[this.column];
    }
    get editorElement(){
        return $(`#editor${this.type.capitalize()}`);
    }
    focus(){
        this.target.focus();
    }
    get htmlDataValue(){
        return $(this.target).attr('data-value');
    }
    get htmlValue(){
        return $(this.target).html
    }
    get id() {
        return $(this.target).attr('data-key');
    }
    get initialDataValue(){
        return _.find(this.table.iData, item=>item.id==this.id)[this.column];
    }
    get isEditable() {
        return $(this.target).attr('contentEditable') === 'true';
    }
    set isEditable(val) {
        $(this.target).attr('contentEditable', val);
    }
    get isEditorInTarget(){
        if (!this.editorElement.length) return false;
        return $(this.parent).children($(`#editor${this.type.capitalize()}`)).length>0
    }
    get isEditorInWarehouse(){
        if (!this.editorElement.length) return true;
        return this.editorElement.parent().attr('id')==='warehouse'
    }
    get isInitialEqual(){
        return _.isEqual(this.dataValue, this.initialDataValue);
    }
    get modelName() {
        return this.table.name;
    }
    moveEditorToTarget(){
        if (!this.isEditorInWarehouse) $(this.editorElement.closest('div.v-t-col')[0]).children('span').show();
        $(this.target).hide();
        $(this.parent).append(this.editorElement);
    }
    moveEditorToWarehouse(){
        $('#warehouse').append($(`#editor${this.type.capitalize()}`));
        $(this.target).show();
    }
    setDataValue(val, text){
        let row = _.find(this.table.data, item=>item.id==this.id)

        const aliases = this.$store.getters['TABLES/GET_SHELL'](this.modelName).controller?.aliases;
        const alias = aliases ? aliases[this.column] : null;
        if (alias){
            Vue.set(row, this.column, parseInt(val));
            const classPoint = _.last(alias.path.split('.'));
            Vue.set(row[classPoint], alias.column, text);
            Vue.set(row[classPoint], 'id', parseInt(val));
        } else {
            Vue.set(row, this.column, val);
        }
        let ret = {}
        ret.model = this.modelName;
        ret.id = this.id;
        ret.column = this.column;
        ret.value = this.dataValue;
        ret.text = text;
        ret.isInitialEqual = this.isInitialEqual;

        this.$store.commit('TABLES/ADD_EDITOR_STACK', ret);
        //this.$store.commit('TABLES/UPDATE_CACHE_AFTER_CHANGE', ret); // AFTER SAVE

        return ret;
    }
    get type() {
        return this.table?.shell?.columns[this.column]?.editor ?? 'none';
    }
}