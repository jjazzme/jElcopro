<template>
    <div class="priceTable">
        <!--price-list-header
                v-model="$props['value']"
        /-->

        <div v-if="loading" class="v-t-loader">
            <!--СПИННЕР-->
            <b-spinner class="v-t-l-spinner" variant="warning" label="Загрузка..." />
        </div>

        <price-list-row
            v-for="(row, rowIndex) in tableData"
            v-model="tableData[rowIndex]"
            :card="value.optics.current._forView.card"
            :quantity="parseInt(value.optics.current.quantity)"
        ></price-list-row>

        <b-button
          v-if="value.price.count>value.optics.itemsLimit"
          @click="value.optics.nextPage()"
        >Показать еще</b-button>

        <div>

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
            value: {type: Object}
        },
        computed:{
            tableData(){
                return this.value.price.data;
            },
            loading(){
                return this.value?.currentOptics?._forProcessing.loading['0'];
            },

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
</style>