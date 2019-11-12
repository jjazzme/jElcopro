<template>
    <div
            class="v-t-row"
            v-if="value"
    >
        <div
                v-for="(lvl1, name1) in card"
                :class="`p-l-${name1}`"
                :key="name1"
        >
            <div
                    v-for="(lvl2, name2) in lvl1"
                    v-if="!lvl2.alias"
                    :class="`p-l-${name2}`"
            >
                <price-list-cell
                  v-if="cell.alias"
                  v-for="(cell, name) in lvl2"
                  v-model="value"
                  :cell="cell"
                />
            </div>
            <price-list-cell
              v-if="cell.alias"
              v-for="(cell, name) in lvl1"
              v-model="value[cell.field]"
              :quantity="quantity"
              :cell="cell"
            />
        </div>
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
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";

    .v-t-row{
        font-size: 14px;
        display: flex;
        text-align: center;
        height: 120px;
        border: @card-border;
        margin: 10px 0;
        background: @table-card-bg;

        .p-l-add{
            width: 10%;

        }
        .p-l-main{
            width: 70%;
            >div{height: 33%};
        }
        .p-l-price{
            width: 20%;
            >div{ //lvl2
                height: 50%;
                >div{ //cell
                    width: 50%;
                }
            };
        }

        >div { //lvl1
            border-right: @card-border;
            flex: 1 1 auto;
            display: flex;
            flex-flow: column nowrap;
            align-content: space-around;
            height: 100%;

            > div { //lvl2
                border-bottom: @card-border;
                flex: 1 1 auto;
                display: flex;
            }
            >div:last-child{border-bottom: none}
        }
        >div:last-child{border-right: none}

    }

</style>