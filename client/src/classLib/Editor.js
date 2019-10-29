'use strict';

import Utils from "@/classLib/Utils";
import Vue from 'vue';

export class FieldEditor {
    /**
     *
     * @param obj
     * @param table
     */
    constructor(obj, table) {
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
    }


    get column() {
        return $(this.target).attr('data-column');
    }
    get dataValue() {
        return _.find(this.table.data, item=>item.id==this.id)[this.column];
    }
    set dataValue(val){
        Vue.set(_.find(this.table.data, item=>item.id==this.id), this.column, val);
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
        if (!$(`#editor${this.type.capitalize()}`).length) return false;
        return $(this.target).children($(`#editor${this.type.capitalize()}`)).length>0
    }
    get isEditorInWarehouse(){
        if (!$(`#editor${this.type.capitalize()}`).length) return true;
        return $(`#editor${this.type.capitalize()}`).parent().attr('id')==='warehouse'
    }
    get isInitialEqual(){
        return _.isEqual(this.dataValue, this.initialDataValue);
    }
    get modelName() {
        return this.table.name;
    }
    moveEditorToTarget(){
        $(this.target).hide();
        $(this.parent).append($(`#editor${this.type.capitalize()}`));
    }
    moveEditorToWarehouse(){
        $('#warehouse').append($(`#editor${this.type.capitalize()}`));
        $(this.target).show();
    }
    setNewValueFromSelector(){

    }
    get type() {
        return this.table?.shell?.columns[this.column]?.editor ?? 'none';
    }
}