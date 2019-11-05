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
                    selectedStores: [],

                    _forProcessing: {
                        loading:{
                            0: null
                        },
                        promises:{
                            0: null
                        },
                        debounceAmount: 1000,
                        stores: null,
                    },
                    _forRouter: {
                        remove: ['debounceAmount', 'stores', 'loading', 'promises']
                    },
                    _forStore:{
                        remove: ['debounceAmount', 'stores', 'quantity', 'fromQuantity', 'loading', 'promises'],
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
                tableParameters:{
                    fieldOrders: _.clone(this.fieldOrdersTemplate),
                    fieldWidth: _.clone(this.fieldWidthTemplate),
                    responses: _.cloneDeep(this.responsesTemplate),
                    currentOptics: _.cloneDeep(this.opticsItemTemplate),
                },
            }
        },
        computed:{
            opticsProcessor(){
                return _.debounce(
                    n => {
                        let loadPrice = (store, optics) => {
                            optics.uid = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
                            this.$set(this.optics.current._forProcessing.loading, store.toString(), true);
                            let promise = this.$store.dispatch('TABLES/LOAD_PRICE', optics);
                            promise
                                .then(response=>{

                                    console.log(response)
                                })
                                .catch(error=>{
                                    if (error==='aborted') {
                                        console.log(`promise ${optics.uid} aborted`)
                                    } else {
                                        console.log(error);
                                        Swal.fire({
                                            title: "ОШИБКА",
                                            text: error,
                                            type: 'error',
                                            timer: 10000
                                        });
                                    }
                                })
                                .finally(()=>{
                                    this.$set(this.optics.current._forProcessing.loading, store.toString(), false);
                                    delete this.optics.current._forProcessing.promises[store.toString()]
                                });
                            this.$set(this.optics.current._forProcessing.promises, store.toString(), optics.uid);
                        };

                        if (this.optics.isCurrentEquivalentPrevious || this.optics.current.searchString.length<4) return;
                        this.tableParameters.responces = _.cloneDeep(this.responsesTemplate);

                        loadPrice(0, this.optics.actualStoreOptics);

                        _.forEach(this.optics.current.selectedStores, storeID=>{
                            let stores = this.optics.current._forProcessing.stores;
                            if(_.find(stores, store=>store.id===storeID).online){
                                let StoreOptics = {name: this.optics.current.searchString, from_store:storeID};
                                loadPrice(storeID, StoreOptics);
                            }
                        });

                        this.optics.setPreviousByCurrent();
                    }, this.optics.current._forProcessing.debounceAmount)
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