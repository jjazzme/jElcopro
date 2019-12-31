<template>
    <div
            class="v-t-row"
            v-if="value"
    >
        <div
               v-for="(lvl1, name1) in value.optics.current._forView.card"
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
                >
                    {{cell.alias}}
                </div>
            </div>
            <div
                    v-for="(cell, name2) in lvl1"
                    :class="`p-l-${name2} p-l-cell`"
                    v-if="cell.alias"
            >
                {{cell.alias}}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "priceListHeader",
        props:{
            value: {
                type: Object,
                default: null,
            }
        },
        computed:{

        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";
    @import "~@/less/priceListCard";
    .v-t-row{
        background-color: @table-header-bg;
        text-transform: uppercase;
        font-weight: 600;
        color: @table-header-text;
        align-items: center;
        .p-l-cell{
            border-right: @table-header-text solid 1px;
            opacity: 0.75;
        };
        >div { //lvl1
            border-right: @table-header-text solid 1px;

            > div { //lvl2
                border-bottom: @table-header-text solid 1px;
            }
        }
    }
</style>