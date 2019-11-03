<template>
    <div class="priceTable">
        <price-list-header
                v-model="value"
        />

        <div
                class="v-t-row"
                v-for="(row, rowInd) in this.value.table"
        >
            <div
                    :style="colStyles[colInd]"
                    v-for="(col, colInd) in row"
                    :key="`${rowInd}-${colInd}`"
            >
                <span v-html="col"></span>
            </div>

        </div>

    </div>
</template>

<script>
    import PriceListHeader from "../tablesHeader/priceListHeader";
    export default {
        name: "priceListBody",
        components:{PriceListHeader},
        props:{
            value: {
                type: Object,
                default: {
                    fieldOrders: [],
                    fieldWidth: [],
                    table:[]
                }
            }
        },
        computed:{
            colStyles(){
                return _.map(this.value.fieldOrders, (val, ind)=>{
                    const width = this.value.fieldWidth[ind] ? `${this.value.fieldWidth}px` : 'auto';
                    return `order: ${val}; min-width: ${width}; max-width: ${width}`
                });
            }
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