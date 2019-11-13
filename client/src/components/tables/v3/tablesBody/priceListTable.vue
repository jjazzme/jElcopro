<template>
    <div class="priceTable">
        <div
          class="svg-cover"
          v-if="loading"
        >
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="spinner" class="svg-inline--fa fa-spinner fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg>
        </div>
        <div
          class="p-l-data"
          v-else
        >
            <price-list-row
              v-for="(row, rowIndex) in table"
              v-model="table[rowIndex]"
              :card="value.shell.card"
              :quantity="parseInt(value.optics.quantity)"
            ></price-list-row>
        </div>
    </div>
</template>

<script>
    import PriceListHeader from "../tablesHeader/priceListHeader";
    import PriceListRow from "./tablesRow/priceListRow";

    export default {
        name: "priceListTable",
        components:{PriceListRow, PriceListHeader},
        props:{
            value: {type: Object},
            loading: null
        },
        data(){
            return{
                table: null,
            }
        },
        computed:{
            frontSensitive(){return this.value.optics.frontSensitive}
        },
        watch:{
            'value.optics.frontSensitive'(n,o){
                this.$set(this, 'table', this.value.data.price(n));
            }
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";
    @breakpoint: 500px;
    .v-t-row{
        display: flex;
        >div{
            flex: 1 1 auto;
            text-align: left;
            border-right: var(--table-body-text) solid 1px;
            min-height: 20px;
        }
    }
    .priceTable{
        flex: 1 1 auto;
        .p-l-data{
            height: 100ch;
            min-height: 100%;
            max-height: 100%;
            overflow: auto;
            margin-bottom: 20px;
        }
        background-color: black;
        display: flex;
        .svg-cover{
            height: 50%;
            min-height: 50%;
            text-align: center;
            margin-top: 30px;
            svg{
                color: @spinner;
                min-height: 100%;
                width: auto;
                animation-name: spin;
                animation-duration: 4000ms;
                animation-iteration-count: infinite;
                animation-timing-function: linear;
            }
            @keyframes spin {
                from {transform:rotate(0deg);}
                to {transform:rotate(360deg);}
            }
        }
    };
</style>