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
                class="p-l-table"
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
                    quantity: 1,
                    fromQuantity: false,
                    selectedStores: [],

                    _forView: {
                        fieldOrders: [],
                        fieldWidth: [],
                        card:{
                            add:{
                                cell1:{alias: 'добавить', component: 'addButton', vModelComputed: 'comp'}
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
                                    cell1: {alias: 'тип', field:'online', html: row=>{
                                        return row.online
                                          ? "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"globe\" class=\"svg-inline--fa fa-globe fa-w-16\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 496 512\"><path fill=\"currentColor\" d=\"M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z\"></path></svg>"
                                          : "<svg aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"database\" class=\"svg-inline--fa fa-database fa-w-14\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><path fill=\"currentColor\" d=\"M448 73.143v45.714C448 159.143 347.667 192 224 192S0 159.143 0 118.857V73.143C0 32.857 100.333 0 224 0s224 32.857 224 73.143zM448 176v102.857C448 319.143 347.667 352 224 352S0 319.143 0 278.857V176c48.125 33.143 136.208 48.572 224 48.572S399.874 209.143 448 176zm0 160v102.857C448 479.143 347.667 512 224 512S0 479.143 0 438.857V336c48.125 33.143 136.208 48.572 224 48.572S399.874 369.143 448 336z\"></path></svg>"


                                    }},
                                    cell2: {alias: 'дата', field:'actual', html: row=>Intl.DateTimeFormat(
                                      'ru-RU',
                                        {
                                            year: 'numeric', month: 'numeric', day: 'numeric',
                                            hour: 'numeric', minute: 'numeric', second: 'numeric',
                                            hour12: false
                                        }).format(new Date(row.actual))},
                                    cell3: {alias: 'упаковка', field:'pack'},
                                    cell4: {alias: 'кратно', field:'multiply'},
                                    cell5: {alias: 'цена $', field:'priceUSD', html: row=>row.convertPrice(row.our_price, row.currency_id).usd.toFixed(2)},
                                    //cell6: {alias: 'сумма $', field:'our_price', field1:'sum_usd', html: num=>num.toFixed(2)},
                                    //cell7: {alias: 'сумма ₽', field:'our_price', field1:'sum_ru', html: num=>num.toFixed(2)},
                                }
                            },
                            price:{
                                first:{
                                    cell1: {alias: 'кол-во', field:'ballance'},
                                    cell2: {alias: 'срок (дней)', field:'average_days'},
                                },
                                second:{
                                    cell1: {alias: 'НДС', field:'vat'},
                                    cell2: {alias: 'цена ₽', field:'priceRUR', html: row=>row.convertPrice(row.our_price, row.currency_id).rur.toFixed(2)},
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
                        remove: []
                    },
                    _forStore:{
                        remove: ['quantity', 'fromQuantity'],
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
                    _forCompare: [{name: 'selectedStores'}, {name: 'searchString'}, {name: 'quantity', skip:opt=>!opt.fromQuantity}]
                }},
            }
        },
        data(){
            return{
                table:{
                    optics: new Optics(_.cloneDeep(this.opticsItemTemplate), {}),
                    responses: _.cloneDeep(this.responsesTemplate), //ajaxes
                    price: new PriceList(this.$store), // data
                },
            }
        },
        computed:{
            opticsProcessor(){
                return _.debounce(
                    n => {
                        if (this.table.optics.isCurrentEquivalentPrevious || this.table.optics.current.searchString.length<4) return;

                        let loadPrice = (store, optics) => {
                            let uid = this.table.optics.current._forProcessing.promises[store.toString()];
                            let source = uid ? this.$store.getters['TABLES/GET_AXIOS_SOURCES'](uid) : null;
                            if (uid) source.cancel('aborted');

                            //delete this.table.optics.current._forProcessing.loading[store.toString()];

                            optics._uid = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
                            this.$set(this.table.optics.current._forProcessing.loading, store.toString(), true);

                            let promise = this.$store.dispatch('TABLES/LOAD_PRICE', optics);
                            promise
                                .then(response=>{
                                    console.log(response);
                                    this.table.price.addData(response.data)
                                })
                                .catch(error=>{
                                    if (error.message==='aborted') {
                                        console.log(`promise ${optics._uid} aborted`)
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
                            this.$set(this.table.optics.current._forProcessing.promises, store.toString(), optics._uid);
                        };

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
            this.table.price.optics = this.table.optics;
        },
        watch:{
            'table.optics.current': {
                handler: function(n){this.opticsProcessor(n)},
                deep: true
            }
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";
    .p-l-table{
        background-color: @table-body-bg;
        color: @table-body-bg;
        display: flex;
        flex-flow: column nowrap;
        transition: 0.5s;
    }

</style>