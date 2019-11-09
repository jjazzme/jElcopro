'use strict';

import Utils from "@/classLib/Utils";
import Vue from 'vue';
import store from '../store/_default';
import Enums from "../modules/enums";
import Swal from "sweetalert2";

export class FieldEditor {

    /**
     *
     * @param obj
     * @param table
     */
    constructor(obj, table, store) {
        this.enums = new Enums();
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
        this._disabled = false;
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
    get disabled(){return this._disabled}
    set disabled(val){this._disabled = !!val}
    get editorElement(){
        return $(`#editor${this.type.capitalize()}`);
    }
    focus(){
        this.target.focus();
    }
    get htmlDataValue(){
        return $(this.target).attr('data-value');
    }
    get htmlValue(){ return $(this.target).html()}
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
        let ret = {};
        ret.model = this.modelName;
        ret.id = this.id;
        ret.column = this.column;
        ret.value = val; //this.dataValue;
        ret.text = text;
        ret.isInitialEqual = _.isEqual(_.find(this.table.data, item=>item.id==this.id)[this.column]?.toString(), val?.toString()); //this.isInitialEqual;

        this.$store.commit('TABLES/ADD_EDITOR_STACK', ret);
        //this.$store.commit('TABLES/UPDATE_CACHE_AFTER_CHANGE', ret); // AFTER SAVE

        return ret;
    }
    setEditorElementContent(){
        if (this.type === this.enums.editorTypes.String) {
            this.editorElement.text(this.textValue)
            this.editorElement[0].focus();
        } else if (this.type === this.enums.editorTypes.Selector){
            this.disabled = true;
            this.$store.dispatch('TABLES/GET_OPTIONS',{
                model: this.modelName,
                column: this.column,
                value: this.dataValue,
                text: this.htmlValue
            }).then(
                r=>{
                    this.props.selector = {options: r.options, selected: r.selected}
                    this.disabled = false;
                    this.editorElement[0].focus();
                },
                e=>{
                    Swal.fire({
                        title: 'Ошибка селектора',
                        text:  e,
                        type:  'error',
                        timer: 10000
                    });
                }
            );
        }
    }
    get textValue(){ return $(this.target).text()}
    get type() {
        return this.table?.shell?.columns[this.column]?.editor ?? 'none';
    }
}