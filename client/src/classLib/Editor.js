'use strict';

import {capitalize} from "@/classLib/Utils";

export class FieldEditor {
    /**
     *
     * @param obj
     * @param table
     */
    constructor(obj, table) {
        this.obj = obj;
        this.table = table;
        this.target = $($(obj.target ? obj.target : obj).closest('div.v-t-col')[0]).children('span')[0];
        this.parent = $(this.target).parent;
        this.props = {
            selector:{
                options: null,
                selected: null
            }
        }
    }


    get column() {
        return $(this.target).attr('data-column');
    }
    get dataValue() {
        return _.find(this.table.data, item=>item.id===this.id)[0][this.column];
    }
    get htmlDataValue(){
        return $(this.target).attr('data-value');
    }
    get id() {
        return $(this.target).attr('data-key');
    }
    get initialDataValue(){
        return _.find(this.table.iData, item=>item.id===this.id)[0][this.column];
    }
    get htmlValue(){
        return $(this.target).html
    }
    get type() {
        return this.table?.shell?.columns[this.column]?.editor ?? 'none';
    }
    get modelName() {
        return this.table.name;
    }
    get isEditable() {
        return $(this.target).attr('contentEditable') === 'true';
    }
    set setEditable(val) {
        $(this.target).attr('contentEditable', val);
    }
    focus(){
        this.target.focus();
    }
    get isEditorInWarehouse(){
        return $(`#editor${this.type.capitalize}`).parent().attr('id')==='warehouse'
    }
    get isEditorInTarget(){
        return $(this.target).children($(`#editor${this.type.capitalize}`)).length>0
    }
    moveEditorToWaregouse(){
        $('#warehouse').append($(`#editor${this.type.capitalize}`));
        $(this.target).show();
    }
    moveEditorToTarget(){
        $(this.target).hide();
        $(this.parent).append($(`#editor${this.type.capitalize}`));
    }


}