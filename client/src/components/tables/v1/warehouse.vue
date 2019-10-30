<template>
    <div style="display: none" id="warehouse">
        <b-form-select
                id="editorSelector"
                :options="editorSelector.options"
                v-model="editorSelector.selected"
                v-on:change="inputSelectChange"
        ></b-form-select>
    </div>
</template>

<script>
    import Utils from "@/classLib/Utils";
    import Enums from "../../../modules/enums";
    export default {
        name: "warehouse",
        data(){
            return {
                Utils: new Utils(),
                enums: new Enums(),
            }
        },
        props: {
            //value: {type: Object},
            value: {},
        },
        computed:{
            editorSelector(){
                const options = this.value.type === this.enums.editorTypes.Selector && !_.isEmpty(this.value?.props?.selector?.options)
                    ? _.sortBy(this.value.props.selector.options, item=>item.text)
                    : [];
                const selected= this.value.type === this.enums.editorTypes.Selector && !_.isEmpty(this.value?.props?.selector?.options)
                    ? this.value.props.selector.selected
                    : null;
                return {options, selected}
            },
        },
        methods: {
            inputSelectChange(val){
                const text = _.find(this.editorSelector.options, item=>item.value==val).text;
                this.value.setDataValue(val, text);
                this.value.moveEditorToWarehouse();
            },
        },
    }
</script>

<style scoped lang="scss">
    .notsaved{outline-color: #ff9999; outline-style: auto;}
    .custom-select{padding: 2px 14px 2px 5px; height: 30px; margin: 0 3px; width: calc(100% - 6px);}
</style>