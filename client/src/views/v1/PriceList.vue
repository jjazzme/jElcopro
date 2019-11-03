<template>
    <article>
        <page-environment
                :head="{title: {main: 'сервисы', method: 'прайслист'}}"
        />
        <price-list-parameters-constructor
                v-model="topParameters"
        />
        <price-list-table
                v-model="tableParameters"
        />
    </article>
</template>

<script>
    import PriceListParametersConstructor
        from "../../components/tables/v2/serverSideParametersConstructor/priceListParametersConstructor";
    import PriceListTable from "../../components/tables/v2/tablesBody/priceListTable";

    export default {
        name: "PriceList",
        components: {PriceListTable, PriceListParametersConstructor},
        props:{
            fieldOrdersTemplate:{
                type: Array,
                default: ()=>{return [0,1,2,3,4,5,6,7,8,9]},
            },
            fieldWidthTemplate:{
                type: Array,
                default: ()=>{return [0,0,0,0,0,0,0,0,0,0]},
            },
        },
        data(){
            return{
                topParameters: {
                    selectedStores:[],
                    searchString: '',
                    quantity: null,
                    fromQuantity: false,
                    debounceAmount: 1000,
                },
                prevTopParameters: null,
                tableParameters:{
                    fieldOrders: _.clone(this.fieldOrdersTemplate),
                    fieldWidth: _.clone(this.fieldWidthTemplate),
                    table:[
                        [0,1,2,3,4,5,6,7,8,9],
                        [1,2,3,4,5,6,7,8,9,0],
                        [0,1,2,3,4,5,6,7,8,9],
                        [1,2,3,4,5,6,7,8,9,0],
                        [0,1,2,3,4,5,6,7,8,9],
                        [1,2,3,4,5,6,7,8,9,0],
                        [0,1,2,3,4,5,6,7,8,9],
                        [1,2,3,4,5,6,7,8,9,0],
                    ],
                },
            }
        },
        computed:{
            topParametersWatcher(val){
                return _.debounce(
                    n => {
                        if (_.isEqual(n, this.prevTopParameters)) return
                        this.prevTopParameters = _.cloneDeep(n)
                        console.log(n)
                    }, this.topParameters.debounceAmount)
            },
        },
        created() {
            this.prevTopParameters = _.cloneDeep(this.topParameters);
        },
        watch:{
            topParameters: {
                handler: function(n){this.topParametersWatcher(n)},
                deep: true
            }
        }
    }
</script>

<style scoped lang="scss">

</style>