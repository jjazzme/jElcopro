<template>
    <div class="v-t-header">
        <div :style="colStyles[0]"><div>код/склад/поставщик</div></div>
        <div :style="colStyles[1]"><div>тип/дата</div></div>
        <div :style="colStyles[2]"><div>название/производитель/корпус</div></div>
        <div :style="colStyles[3]"><div>упак./кратно</div></div>
        <div :style="colStyles[4]"><div>min/max/кол-во</div></div>
        <div :style="colStyles[5]"><div>цена/сумма ₽</div></div>
        <div :style="colStyles[6]"><div>цена/сумма $</div></div>
        <div :style="colStyles[7]"><div>ндс</div></div>
        <div :style="colStyles[8]"><div>срок(дней)</div></div>
        <div :style="colStyles[9]"><div>в счёт/заказ</div></div>
    </div>
</template>

<script>
    export default {
        name: "priceListHeader",
        props:{
            value: {
                type: Object,
                default: {
                    fieldOrders: [],
                    fieldWidth: [],
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
    .v-t-header{
        background-color: @table-header-bg;
        color: @table-header-text;
        display: flex;
        >div{
            flex: 1 1 auto;
            display: flex;
            text-align: center;
            border-right: var(--table-header-text) solid 1px;
            min-height: 50px;
            text-transform: uppercase;
            >div{
                flex: 1 1 auto
            }
        }
    }
</style>