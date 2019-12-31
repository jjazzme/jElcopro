<template>
    <article>
        <price-list-parameters-constructor
          v-if="value.isStores"
          v-model="value"
        />
        <price-list-table
          v-model="value"
          :loading="rootLoading"
          class="p-l-table"
        />
        <page-environment
          v-show="false"
          :head="{title: {main: 'сервисы', method: 'прайслист'}}"
          :foot="footer"
        />
    </article>
</template>

<script>
    import Footer from "../../classLib/Footer";
    import PriceListParametersConstructor
        from "../../components/tables/v3/serverSideParametersConstructor/priceListParametersConstructor";
    import PriceListTable from "../../components/tables/v3/tablesBody/priceListTable";
    import PriceSource from "../../classLib/PriceSource";
    import Swal from "sweetalert2";
    //import router from "../../router";

    export default {
        name: "PriceList",
        components: {PriceListTable, PriceListParametersConstructor},
        data: function () {
            return {
                footer: new Footer({name: 'priceListFooter', vmodel: null}),
                rootLoading: false,
                prevBackOptics: null,
                //TODO UserLevel (enums)
                value: new PriceSource({
                    search:'max', quantity:5, fromQuantity:false, onlyDB: true, selectedStores:[1,2],
                    depth:10, pages:1, debounceAmount:1000, minSearchLenSensitivity:4
                }),
            }
        },
        computed:{
            backSensitive(){ return this.value.backSensitive },
            frontSensitive(){ return this.value.frontSensitive },
            getSources(){
                // вынесено сюда для динамического амаунтинга
                return _.debounce(
                  (backOptics, isCanceled) => {
                    if (
                      (_.isEqual(this.prevBackOptics, backOptics) && !isCanceled)
                      || this.value.search.length < this.value.minSearchLenSensitivity) return;

                    this.$set(this.value, 'source', []);

                    this.loadPrice(0, backOptics);
                    if(!this.value.onlyDB)
                    {
                        _.forEach(this.value.selectedStores, storeID=>{
                            if(_.find(this.value.references.stores, store=>store.id===storeID).online){
                                let StoreOptics = {name: backOptics.name, from_store:storeID};
                                this.loadPrice(storeID, StoreOptics);
                            }
                        });
                    }

                    this.prevBackOptics = backOptics
                    }, this.value.debounceAmount)
            },
        },
        created() {
            // загрузка справочников
            const refLoader = (refs) => {
                _.forEach(refs, item=>{
                    this.$store.dispatch('TABLES/LOAD_REFDATA', item.dispatchParam)
                      .then(resp=> {
                          this.$set(this.value.references, item.dataName, resp)
                      })
                      .catch(err=>{
                          console.log(err);
                          Swal.fire({
                              title: `Ошибка получения справочника ${item.errorAddText}.`,
                              text:  JSON.stringify(err),
                              type:  'error',
                              timer: 10000
                          });
                      })
                      .finally(()=>{
                          // последовательность
                          if(item.after) refLoader(item.after)
                      });
                });
            };
            refLoader(this.value.refsOrder);

            this.footer.vmodel = this.value;

            this.$store.dispatch('ENV/SET_ROUTE', {name: this.$route.name, params: this.$route.params, query: this.$route.query})
        },
        methods:{
            loadPrice(store, optics){
                if (_.isInteger(store) && store !== 0) store = this.value.getStoreById(store);
                this.cancelAxios(store);

                optics._uid = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
                if (store) this.$set(store, "_loading", optics._uid);
                else this.$set(this, "rootLoading", optics._uid);

                let promise = this.$store.dispatch('TABLES/LOAD_PRICE', optics);
                promise
                  .then(response=>{
                      // агрегируем
                      _.forEach(response.data, row=>{
                          if(row.id === 0){
                              this.value.source.push(row);
                          } else{
                              const ind = _.findIndex(this.value.source, (item) => item.id === row.id);
                              if (ind<0) {
                                  this.value.source.push(row);
                              } else {
                                  const item = this.value.source[ind];
                                  if (Date.parse(row.actual)>Date.parse(item.actual)) {
                                      this.value.source.splice(ind, 1, row)
                                  }
                              }
                          }
                      });
                      // для перерисовки
                      this.value.updateID = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
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
                      if (store) this.$set(store, "_loading", false);
                      else this.$set(this, "rootLoading", false);
                  });
            },
            cancelAxios(store){
                if (_.isInteger(store) && store !== 0) store = this.value.getStoreById(store);
                let uid = store ? store._loading : this.rootLoading;
                if (uid){
                    let source = this.$store.getters['TABLES/GET_AXIOS_SOURCES'](uid);
                    source.cancel('aborted');
                    if (store) this.$set(store, "_loading", false);
                    else this.$set(this, "rootLoading", false);
                    return true;
                }
                return false;
            },
        },
        mounted(){
            const val = this.$route.query;
        },
        watch:{
            'value.isStores'(n){
                if (n && this.$route.query.optics) {
                    //this.value = Object.assign({}, this.value, JSON.parse(this.$route.query.optics));
                    const optics = JSON.parse(this.$route.query.optics);
                    _.forEach(optics, (val, key)=>{
                        this.$set(this.value, key, val)
                    });
                }
            },
            backSensitive(n) {
                if (!n) return;
                // прерываем мгновенно уже созданные
                let isCanceled = false;
                _.forEach(this.value.references.stores, store=>{
                    if (n.onlyDB) isCanceled = isCanceled || this.cancelAxios(store);
                    else if(n.name!==this.prevBackOptics?.name) isCanceled = isCanceled || this.cancelAxios(store);
                    else if (!n.from_store_ids.includes(store.id)) isCanceled = isCanceled || this.cancelAxios(store);
                });
                // передаём на дебоунс
                this.getSources(n, isCanceled)
            },
            frontSensitive: {
                handler: _.debounce(function(n){
                    if(n && !_.isEqual(n, JSON.parse(this.$route.query.optics ?? "{}"))) {
                        this.$router.push({ query: { optics: JSON.stringify(n) } });
                        this.$store.dispatch('ENV/SET_ROUTE', {name: this.$route.name, params: this.$route.params, query: this.$route.query})
                    }
                },500)
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