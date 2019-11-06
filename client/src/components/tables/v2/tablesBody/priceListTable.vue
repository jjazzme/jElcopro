<template>
    <div class="priceTable">
        <price-list-header
                v-model="$props['value']"
        />

        <div v-if="loading" class="v-t-loader">
            <!--СПИННЕР-->
            <b-spinner class="v-t-l-spinner" variant="warning" label="Загрузка..." />
        </div>

        <price-list-row
            v-for="(row, rowIndex) in value.price.data"
            v-model="value.price.data[rowIndex]"
            :card="value.optics.current._forView.card"
        ></price-list-row>

    </div>
</template>

<script>
    import PriceListHeader from "../tablesHeader/priceListHeader";
    import PriceListRow from "./tablesRow/priceListRow";

    export default {
        name: "priceListBody",
        components:{PriceListRow, PriceListHeader},
        props:{
            value: {type: Object}
        },
        computed:{
            loading(){
                return this.value?.currentOptics?._forProcessing.loading['0'];
            },

        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";
    @breakpoint: 500px;
    .priceTable{
        background-color: @table-body-bg;
        color: @table-header-bg;
        display: flex;
        flex-flow: column nowrap;
        transition: 0.5s;
        .v-t-row{
            display: flex;
            >div{
                flex: 1 1 auto;
                text-align: left;
                border-right: var(--table-body-text) solid 1px;
                min-height: 20px;
            }
        }

    }
</style>