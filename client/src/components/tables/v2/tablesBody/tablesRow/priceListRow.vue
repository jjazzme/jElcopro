<template>
    <div
            class="v-t-row"
            v-if="value"
    >
        <div
                v-for="(lvl1, name1) in card"
                :class="`p-l-${name1}`"
        >
            <div
                    v-for="(lvl2, name2) in lvl1"
                    v-if="!lvl2.alias"
                    :class="`p-l-${name2}`"
            >
                <div
                        v-for="(cell, name3) in lvl2"
                        :class="`p-l-${name3} p-l-cell`"
                        v-html="value[cell.field]"
                >
                </div>
            </div>
            <div
                    v-for="(cell, name2) in lvl1"
                    :class="`p-l-${name2} p-l-cell`"
                    v-if="cell.alias"
                    v-html="value[cell.field]"
            >

            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "priceListRow",
        props:{
            value: null,
            card: null,
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";
    @import "~@/less/priceListCard";

    .v-t-row{
        border: @table-body-text-transp solid 1px;
        margin: 10px 0;
        background-color: @table-body-bg;
        .p-l-cell{
            color: @table-body-text;
            border-right: @table-body-text-transp solid 1px;
        };
        >div { //lvl1
            border-right: @table-body-text-transp solid 1px;

            > div { //lvl2
                border-bottom: @table-body-text-transp solid 1px;
            }
        }
    }

</style>