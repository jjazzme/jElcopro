<template>
  <article>
    <price-list-parameters-constructor
      v-model="model"
    />

    <price-list-table
      v-model="model.dataSource.priceList"
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
  import PriceListParametersConstructor
    from "../../components/tables/v3/serverSideParametersConstructor/priceListParametersConstructor";
  import Footer from "../../classLib/Footer";
  import PriceListTable from "../../components/tables/v3/tablesBody/priceListTable";

  export default {
    name: "PriceList",
    components: {PriceListTable, PriceListParametersConstructor},
    props: {
      model: null,
    },
    data(){
      return{
        footer: new Footer({name: 'priceListFooter', vmodel: null}),
        prevBackOptics: null,
        rootLoading: false,
      }
    },
    computed:{
      backSensitive(){ return this.model.dataSource.priceList.backSensitive },
      frontSensitive(){ return this.model.dataSource.priceList.frontSensitive },
      getSources(){
        // вынесено сюда для динамического амаунтинга
        return _.debounce(
          (backOptics) => {
            if (_.isEqual(this.prevBackOptics, backOptics)) return;
            this.$set(this.model.dataSource.priceList, 'source', []);

            this.loadPrice(0, backOptics);
            if(!this.model.dataSource.priceList.onlyDB)
            {
              _.forEach(this.model.dataSource.priceList.selectedStores, storeID=>{
                if(_.find(this.model.dataSource.priceList.references.stores, store=>store.id===storeID).online){
                  let StoreOptics = {name: backOptics.name, from_store:storeID};
                  this.loadPrice(storeID, StoreOptics);
                }
              });
            }

            this.prevBackOptics = _.cloneDeep(backOptics);
          }, this.model.dataSource.priceList.debounceAmount)
      },
      //stores(){ return this.model.dataSource.getTableByType('Store') },
    },
    methods:{
      cancelAxios(store){
        if (_.isInteger(store) && store !== 0) store = this.model.dataSource.priceList.getStoreById(store);
        let eid = store ? store._loading : this.rootLoading;
        if (eid){
          let request = this.$store.getters['Binder/getRequestByEid'](eid);
          request.source.cancel('aborted');
          if (store) this.$set(store, "_loading", false);
          else this.$set(this, "rootLoading", false);

          this.$store.commit('Binder/removeRequest', request.uid);

          return store.id;
        }
        return false;
      },
      loadPrice(store, optics){
        if (_.isInteger(store) && store !== 0) store = this.model.dataSource.priceList.getStoreById(store);
        this.cancelAxios(store);

        const eid = `f${(+new Date).toString(16)}x${(~~(Math.random()*1e8)).toString(16)}`;
        if (store) this.$set(store, "_loading", eid);
        else this.$set(this, "rootLoading", eid);

        let promise = this.$store.dispatch('Binder/getByOptics', { type: 'Price', payload: { optics: optics, eid: eid } });
        promise
          .then(response=>{
            // агрегируем
            _.forEach(response.data, row=>{
              if(row.id === 0){
                this.model.dataSource.priceList.source.push(row);
              } else{
                const ind = _.findIndex(this.model.dataSource.priceList.source, (item) => item.id === row.id);
                if (ind<0) {
                  this.model.dataSource.priceList.source.push(row);
                } else {
                  const item = this.model.dataSource.priceList.source[ind];
                  if (Date.parse(row.actual)>Date.parse(item.actual)) {
                    this.model.dataSource.priceList.source.splice(ind, 1, row)
                  }
                }
              }
            });
            // для перерисовки
            this.model.dataSource.priceList.updateID++;
          })
          .finally(()=>{
            if (store) this.$set(store, "_loading", false);
            else this.$set(this, "rootLoading", false);
          });
      },
    },
    created(){
      this.footer.vmodel = this.model.dataSource.priceList;
      //this.model.dataSource.loadTableByType('Store');
    },
    watch:{
      backSensitive(n) {
        if (!n) return;
        // прерываем мгновенно уже созданные
        let isCanceled = false;
        _.forEach(this.model.dataSource.priceList.references.stores, store=>{
          if (n.onlyDB) isCanceled = isCanceled || this.cancelAxios(store);
          else if(n.name!==this.prevBackOptics?.name) isCanceled = isCanceled || this.cancelAxios(store);
          else if (!n.from_store_ids.includes(store.id)) isCanceled = isCanceled || this.cancelAxios(store);
        });

        let getSource = true;

        if (isCanceled) {
          getSource = false;
          this.prevBackOptics = null;
        }
        if (_.isEqual(this.prevBackOptics, n)) getSource = false;
        if (this.model.dataSource.priceList.search.length < this.model.dataSource.priceList.minSearchLenSensitivity) getSource = false;

        // передаём на дебоунс
        if (getSource) this.getSources(n)
      },
    },
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