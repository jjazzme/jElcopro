<template>
    <div class="priceTable">
        <!--spinner-->
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
              v-for="(row, rowIndex) in showingPrice"
              :key="`${value.priceKey}_${rowIndex}`"
              v-model="showingPrice[rowIndex]"
              :card="value.card"
              :row-key-prefix="`${value.priceKey}_${rowIndex}`"
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
            value: null,
            loading: null
        },
        computed:{
            showingPrice(){
                return this.showingPriceMethod();

            }
        },
        methods:{
            showingPriceMethod(){
                if (this.value.source.length === 0) return null;

                // обрубаем неприменимое (если УЧИТЫВАТЬ КОЛ-ВО)
                const minBallance = this.fromQuantity ? this.quantity : 1;
                let ret = this.value.fromQuantity
                  ? _.filter(this.value.source, row=>row.ballance>=minBallance && row.ballance>=row.min)
                  : _.clone(this.value.source);

                // обрезаем вывод если чекрыжек по актуальности
                if (this.value.fromRelevance) ret = _.filter(ret, row=>Math.abs(Date.now() - new Date(row.actual)) / 36e5 <= this.value.relevance);

                const limit = this.value.depth*this.value.pages;
                const offset = this.value.offset;

                const rates = this.value.references.currencyRates;
                const cures = this.value.references.currency;

                //считаем рубли и суммы
                _.forEach(ret, (row)=>{
                    let rur = row.currency_id==='R01000'
                      ? row.our_price
                      : row.currency_id==='R01235'
                        ? row.our_price*_.find(rates, item=>item.currency_id==="R01235").rate
                        : row.our_price * _.find(rates, item => item.currency_id === row.currency_id).rate / _.find(cures, item => item.id === row.currency_id).nominal;

                    const v1 = this.value.quantity<row.min ? row.min : this.value.quantity;
                    const v2 = v1 % row.multiply ? row.multiply + v1 - (v1 % row.multiply) : v1;
                    row._realCount = row.max > v2 ? v2 : row.max;

                    row._priceRUR = rur;
                    row._sumRUR = rur * row._realCount;

                });

                // обрезаем вывод если чекрыжек по количеству
                if (this.value.fromQuantity) ret = _.filter(ret, row=>row._realCount>=this.value.quantity);

                this.$set(this.value, 'filteredCount', ret.length)
                // сортировка и обрезка
                ret = (this.value.fromQuantity ? _.sortBy(ret, ['_sumRUR']) : _.sortBy(ret, ['_realCount', '_priceRUR'], ['desc','asc']) )
                  .slice(offset, limit);

                // валютные суммы
                _.forEach(ret, (row)=>{
                    let usd = row.currency_id==='R01235'
                      ? row.our_price
                      : row.currency_id==='R01000'
                        ? row.our_price/_.find(rates, item=>item.currency_id==="R01235").rate
                        : row._priceRUR / _.find(rates, item => item.currency_id === "R01235").rate;


                    row._priceUSD = usd;
                    row._sumUSD = usd * row._realCount;
                    row._relevance = this.value.relevance;
                });

                // для генерации кеев в-форов
                this.$set(this.value, 'priceKey', `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`);
                return ret
            }
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";
    .priceTable{
        flex: 1 1 auto;
        .p-l-data{
            width: 100%;

            overflow: auto;
        }
        @media @mob { .p-l-data { margin-bottom: 5px } }
        @media @des { .p-l-data { margin-bottom: 10px } }
        @media @wid { .p-l-data { margin-bottom: 20px } }

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