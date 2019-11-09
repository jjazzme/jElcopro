<template>
    <article>
        <page-environment
                :head="{title: {main: 'сервисы', method: 'прайслист'}}"
        />
        <price-list-parameters-constructor
                v-model="table.optics.current"
        />
        <price-list-table
                v-model="table"
        />
    </article>
</template>

<script>
    import PriceListParametersConstructor
        from "../../components/tables/v2/serverSideParametersConstructor/priceListParametersConstructor";
    import PriceListTable from "../../components/tables/v2/tablesBody/priceListTable";
    import Optics from "../../classLib/Optics";
    import PriceList from "../../classLib/PriceList";
    import Swal from "sweetalert2";

    export default {
        name: "PriceList",
        components: {PriceListTable, PriceListParametersConstructor},
        props:{
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

                    _forView: {
                        fieldOrders: [],
                        fieldWidth: [],
                        card:{
                            add:{
                                cell1:{alias: 'добавить', component: 'priceRowAdd', vModelComputed: 'comp'}
                            },
                            main:{
                                first:{
                                    cell1: {alias:'название', field:'name', to: item=> {return {name:'goods', params:{id:item.good_id}}}},
                                    cell2: {alias: 'производитель', field:'producer_name', to: item=> {return {name:'producer', params:{id:item.producer_id}}} },
                                    cell3: {alias: 'корпус', field: 'case', to: item=> {return {name:'case', params:{id:item.parameter_id}}}},
                                    cell4: {alias: 'примечание', field: 'remark'},
                                },
                                second:{
                                    cell1: {alias: 'код', field:'code'},
                                    cell2: {alias: 'склад', field:'store_name', to: item=> {return {name:'store', params:{id:item.store_id}}}},
                                    cell3: {alias: 'поставщик', field:'party_name', to: item=> {return {name:'company', params:{id:item.company_id}}} },
                                    cell4:{alias: 'минимум', field:'min'},
                                    cell5:{alias: 'максимум', field:'max'},
                                },
                                third:{
                                    cell1: {alias: 'тип', field:'online'},
                                    cell2: {alias: 'дата', field:'actual'},
                                    cell3: {alias: 'упаковка', field:'pack'},
                                    cell4: {alias: 'кратно', field:'multiply'},
                                    cell5: {alias: 'цена $', field:'our_price', field1:'price_usd'},
                                    cell6: {alias: 'сумма $', field:'our_price', field1:'sum_usd'},
                                    cell7: {alias: 'сумма ₽', field:'our_price', field1:'sum_ru'},
                                }
                            },
                            price:{
                                first:{
                                    cell1: {alias: 'кол-во', field:'balance'},
                                    cell2: {alias: 'срок', field:'average_days'},
                                },
                                second:{
                                    cell1: {alias: 'НДС', field:'vat'},
                                    cell2: {alias: 'цена ₽', field:'our_price', field1:'price_ru'},
                                },
                            }
                        },
                        fields:{
                            //actual: {example:"2019-11-06T04:26:04.000Z", title: 'дата'},
                            //average_days: {example:3},
                            //ballance: {example:6},
                            //case: {example:"DIP-16"},
                            //code: {example:"319844",},
                            //company_id: {example:3},
                            //createdAt: {example:"2019-11-03T11:01:52.000Z"},
                            currency_id: {example:"R01000"},
                            for_all_price: {example:"87.890000"},
                            //good_id: {example:21148},
                            id: {example: 21046},
                            //max: {example:17},
                            //min: {example:6},
                            //multiply: {example:1},
                            //name: {example:"MAX232CPE+"},
                            //online: {example:0},
                            our_price: {example:"76.090000"},
                            //pack: {example:25},
                            //parameter_id: {example:1546},
                            //party_name: {example:"ООО ТД ПРОМЭЛЕКТРОНИКА"},
                            picture: {example:null},
                            //producer_id: {example:237},
                            //producer_name: {example:"MAX"},
                            //product_id: {example:9469},
                            //remark: {example:" "},
                            //store_id: {example:3},
                            //store_name: {example:"Склад ЕКБ"},
                            //updatedAt: {example:"2019-11-06T04:26:04.000Z"},
                            //vat: {example:"20"},
                            with_vat: {example:true},
                        },
                        pageSize: 15,
                        pages: 1,
                    },
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
                table:{
                    optics: new Optics(_.cloneDeep(this.opticsItemTemplate), {}),
                    responses: _.cloneDeep(this.responsesTemplate), //ajaxes
                    price: new PriceList(), // data
                },
            }
        },
        computed:{
            opticsProcessor(){
                return _.debounce(
                    n => {
                        let loadPrice = (store, optics) => {
                            optics.uid = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
                            this.$set(this.table.optics.current._forProcessing.loading, store.toString(), true);
                            let promise = this.$store.dispatch('TABLES/LOAD_PRICE', optics);
                            promise
                                .then(response=>{
                                    console.log(response)
                                    this.table.price.addData(response.data)
                                })
                                .catch(error=>{
                                    if (error.message==='aborted') {
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
                                    this.$set(this.table.optics.current._forProcessing.loading, store.toString(), false);
                                    delete this.table.optics.current._forProcessing.promises[store.toString()]
                                });
                            this.$set(this.table.optics.current._forProcessing.promises, store.toString(), optics.uid);
                        };

                        if (this.table.optics.isCurrentEquivalentPrevious || this.table.optics.current.searchString.length<4) return;
                        this.table.responces = _.cloneDeep(this.responsesTemplate);

                        this.table.price.clearData();
                        loadPrice(0, this.table.optics.actualStoreOptics);

                        _.forEach(this.table.optics.current.selectedStores, storeID=>{
                            let stores = this.table.optics.current._forProcessing.stores;
                            if(_.find(stores, store=>store.id===storeID).online){
                                let StoreOptics = {name: this.table.optics.current.searchString, from_store:storeID};
                                loadPrice(storeID, StoreOptics);
                            }
                        });

                        this.table.optics.setPreviousByCurrent();
                    }, this.table.optics.current._forProcessing.debounceAmount)
            },
        },
        created() {

        },
        watch:{
            'table.optics.current': {
                handler: function(n){this.opticsProcessor(n)},
                deep: true
            }
        }
    }
</script>

<style scoped lang="scss">

</style>