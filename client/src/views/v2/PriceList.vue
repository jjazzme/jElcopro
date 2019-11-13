<template>
    <article>
        <price-list-parameters-constructor
          v-if="value.data.stores"
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

    export default {
        name: "PriceList",
        components: {PriceListTable, PriceListParametersConstructor},
        data: function () {
            return {
                footer: new Footer({name: 'priceListFooter', vmodel: null}),
                rootLoading: false,
                prevBackOptics: null,
                value: new PriceSource({
                    optics: {search:'max', quantity:5, fromQuantity:false, onlyDB: true, selectedStores:[1,2], depth:10, pages:1, debounceAmount:1000},
                }),
            }
        },
        computed:{
            opticsProcessorBack(){
                return _.debounce(
                    backOptics => {
                        if (
                          _.isEqual(this.prevBackOptics, backOptics)
                          || this.value.optics.search.length < this.value.optics.minSearchLenSensitivity) return;

                        let loadPrice = (storeID, optics) => {
                            let store =  this.value.data.getStoreById(storeID);
                            let uid = store ? store._loading : this.rootLoading;
                            let source = uid ? this.$store.getters['TABLES/GET_AXIOS_SOURCES'](uid) : null;
                            if (uid) {
                                source.cancel('aborted');
                                if (store) this.$set(store, "_loading", false);
                                else this.$set(this, "rootLoading", false);
                            }

                            optics._uid = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
                            if (store) this.$set(store, "_loading", optics._uid);
                            else this.$set(this, "rootLoading", optics._uid);

                            let promise = this.$store.dispatch('TABLES/LOAD_PRICE', optics);
                            promise
                              .then(response=>{
                                  console.log(response);
                                  this.value.data.add(response.data)
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
                        };

                        this.value.data.clear();
                        loadPrice(0, backOptics);
                        if(!this.value.onlyDB)
                        {
                            _.forEach(this.value.optics.selectedStores, storeID=>{
                                if(_.find(this.value.data.references.stores, store=>store.id===storeID).online){
                                    let StoreOptics = {name: backOptics.name, from_store:storeID};
                                    loadPrice(storeID, StoreOptics);
                                }
                            });
                        }

                        this.prevBackOptics = backOptics
                    }, this.value.optics.debounceAmount)
            },
        },
        created() {
            const refLoader = (refs) => {
                _.forEach(refs, item=>{
                    this.$store.dispatch('TABLES/LOAD_REFDATA', item.dispatchParam)
                      .then(resp=>{
                          this.value.data[item.dataName] = resp})
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
                          if(item.after) refLoader(item.after)
                      });
                });
            }
            refLoader(this.value.data.refsOrder)

            this.footer.vmodel = this.value;
        },
        watch:{
            'value.optics.backSensitive'(n) {
                let usingProcessor = true;
                _.forEach(this.value.data.references.stores, store=>{
                    let uid = store._loading;
                    if (uid){
                        if (!n.from_store_ids.includes(store.id)) {
                            let source = this.$store.getters['TABLES/GET_AXIOS_SOURCES'](uid);
                            source.cancel('aborted');
                            this.$set(store, "_loading", false)
                            usingProcessor = false;
                        }
                    }
                });
                if (usingProcessor) this.opticsProcessorBack(n)
            },
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