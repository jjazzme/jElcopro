<template>
    <article>
        <page-environment
                :head="{title: {main: 'сервисы', method: 'прайслист'}}"
        />
        <price-list-parameters-constructor
                v-model="optics.current"
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
    import Optics from "../../classLib/Optics";
    import Swal from "sweetalert2";

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
            responsesTemplate:{
                type: Object,
                default: ()=>{return {
                    0:[]
                }}
            },
            loadingTemplate:{
                type: Object,
                default: ()=>{return {
                    0:false
                }}
            },
            opticsItemTemplate:{
                type: Object,
                default: ()=>{return {
                    searchString: '',
                    quantity: null,
                    fromQuantity: false,
                    debounceAmount: 1000,
                    stores: null,
                    selectedStores: [],
                    loading:{
                      0: null
                    },
                    _forRouter: {
                        remove: ['debounceAmount', 'stores', 'loading']
                    },
                    _forStore:{
                        remove: ['debounceAmount', 'stores', 'quantity', 'fromQuantity', 'loading'],
                        transform: source=>{
                            let ret = {};
                            _.forEach(source, (val, name)=>{
                                if (name==='searchString') ret.name = val;
                                else if (name==='selectedStores') ret.from_store_ids = val;
                                else ret[name] = val;
                            });
                            return ret;
                        },
                    },
                    _forCompare: ['selectedStores', 'searchString', 'quantity']
                }},
            }
        },
        data(){
            return{
                optics: new Optics(_.cloneDeep(this.opticsItemTemplate), {}),
                prevOptics: {},
                tableParameters:{
                    fieldOrders: _.clone(this.fieldOrdersTemplate),
                    fieldWidth: _.clone(this.fieldWidthTemplate),
                    responses: _.cloneDeep(this.responsesTemplate),
                    currentOptics: _.cloneDeep(this.opticsItemTemplate),
                },
            }
        },
        computed:{
            opticsProcessor(val){
                return _.debounce(
                    n => {
                        let loadPrice = (store, optics) => {
                            this.$set(this.optics.current.loading, store.toString(), true);
                                this.$store.dispatch('TABLES/LOAD_PRICE', optics)
                                    .then(response=>{
                                        this.$set(this.optics.current.loading, store.toString(), false);
                                        console.log(response)
                                    })
                                    .catch(error=>{
                                        this.$set(this.optics.current.loading, store.toString(), false);
                                        console.log(error);
                                        Swal.fire({
                                            title: "ОШИБКА",
                                            text: error,
                                            type: 'error',
                                            timer: 10000
                                        });
                                    });
                        };

                        if (this.optics.isCurrentEquivalentPrevious || this.optics.current.searchString.length<4) return;
                        this.tableParameters.responces = _.cloneDeep(this.responsesTemplate);

                        loadPrice(0, this.optics.actualStoreOptics);

                        _.forEach(this.optics.current.selectedStores, storeID=>{
                            let stores = this.optics.current.stores;
                            if(_.find(stores, store=>store.id===storeID).online){
                                let StoreOptics = {name: this.optics.current.searchString, from_store:storeID}
                                loadPrice(storeID, StoreOptics);
                            }
                        });

                        this.optics.setPreviousByCurrent();
                    }, this.optics.current.debounceAmount)
            },
        },
        created() {
            this.tableParameters.currentOptics = this.optics.current;
        },
        watch:{
            'optics.current': {
                handler: function(n){this.opticsProcessor(n)},
                deep: true
            }
        }
    }
</script>

<style scoped lang="scss">

</style>