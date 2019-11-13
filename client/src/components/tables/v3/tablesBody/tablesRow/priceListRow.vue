<template>
    <div
            class="v-t-row"
            v-if="value"
    >
        <div
                v-for="(lvl1, name1) in card"
                :class="`p-l-${name1} p-l-l1`"
                :key="name1"
        >
            <div
              v-for="(lvl2, name2, ind) in lvl1"
              v-if="!lvl2.alias"
              :class="`p-l-${name2}  p-l-l2`"
            >
                <price-list-cell
                  v-if="cell.alias"
                  v-for="(cell, name) in lvl2"
                  v-model="value"
                  :cell="cell"
                />
                <div
                  v-for="(lvl3, name3) in lvl2"
                  v-if="!lvl3.alias"
                  :class="`p-l-${name3}  p-l-l3`"
                >
                    <price-list-cell
                      v-if="cell.alias"
                      v-for="(cell, name) in lvl3"
                      v-model="value"
                      :cell="cell"
                    />

                </div>
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
        height: 80px;
        border: @card-border;
        margin: 10px 0;
        background: @table-card-bg;

        .p-l-one1{
            width: 75%;
            >div{height: 50%};
        }
        .p-l-one2{
            width: 25%;
            >div{ //lvl2
                height: 50%;
                >div{ //cell
                    width: 50%;
                }
            };
        }

        >div.p-l-l1 { //lvl1
            border-right: @card-border;
            flex: 1 1 auto;
            display: flex;
            flex-flow: column nowrap;
            align-content: space-around;
            height: 100%;

            > div.p-l-l2 { //lvl2
                border-bottom: @card-border;
                flex: 1 1 auto;
                display: flex;
                >div.p-l-l3 { //lvl3
                    border-right: @card-border;
                    flex: 1 1 auto;
                    display: flex;
                }
                >div:last-child{border-bottom: none}
            }
            >div:last-child{border-bottom: none}
        }
        >div:last-child{border-right: none}

    }

</style>