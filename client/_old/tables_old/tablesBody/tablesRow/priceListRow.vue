<template>
    <div
            class="v-t-row"
            v-if="value"
    >
        <price-list-cell
          v-for="(cell, name) in card"
          v-if="cell.alias"
          :key="`${rowKeyPrefix}_${cell.field}`"
          v-model="value"
          :cell-key-prefix="`${rowKeyPrefix}_${cell.field}`"
          :cell="cell"
        />
    </div>
</template>

<script>
    import PriceListCell from "./tablesCell/priceListCell";
    export default {
        name: "priceListRow",
        components: {PriceListCell},
        props:{
            value: null,
            card: null,
            quantity: null,
            rowKeyPrefix: null,
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";

    .v-t-row{
        font-size: 14px;
        display: flex;
        flex-flow: row wrap;
        @media @wid {flex-flow: row nowrap;}
        text-align: center;
        border-left: @card-border;
        border-bottom: @card-border;
        margin: 10px 0;
        @media @mob {margin: 20px 0}
        //background: @table-card-bg;
    }
    .v-t-row:nth-child(even){background: @rowEvenBg}
    .v-t-row:nth-child(odd){background: @rowOddBg}

</style>