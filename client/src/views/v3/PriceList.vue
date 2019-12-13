<template>
  <article>
    <price-list-parameters-constructor
      v-model="model"
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

  export default {
    name: "PriceList",
    components: {PriceListParametersConstructor},
    props: {
      model: null,
    },
    data(){
      return{
        footer: new Footer({name: 'priceListFooter', vmodel: null}),
        prevBackOptics: null,
      }
    },
    computed:{
      backSensitive(){ return this.model.dataSource.priceList.backSensitive },
      frontSensitive(){ return this.model.dataSource.priceList.frontSensitive },
      getSources(){
        // вынесено сюда для динамического амаунтинга
        return _.debounce(
          (backOptics, isCanceled) => {
            if (
              (_.isEqual(this.prevBackOptics, backOptics) && !isCanceled)
              || this.model.dataSource.priceList.search.length < this.model.dataSource.priceList.minSearchLenSensitivity) return;

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

            this.prevBackOptics = backOptics
          }, this.model.dataSource.priceList.debounceAmount)
      },
      //stores(){ return this.model.dataSource.getTableByType('Store') },
    },
    methods:{
      cancelAxios(store){
        if (_.isInteger(store) && store !== 0) store = this.model.dataSource.priceList.getStoreById(store);
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
      loadPrice(store, optics){
        if (_.isInteger(store) && store !== 0) store = this.model.dataSource.priceList.getStoreById(store);
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
    },
    created(){
      //this.model.dataSource.loadTableByType('Store');
    },
    watch:{
      backSensitive(n) {
        if (!n) return;
        // прерываем мгновенно уже созданные
        let isCanceled = false;
        //_.forEach(this.model.dataSource.priceList.references.stores, store=>{
        //  if (n.onlyDB) isCanceled = isCanceled || this.cancelAxios(store);
        //  else if(n.name!==this.prevBackOptics?.name) isCanceled = isCanceled || this.cancelAxios(store);
        //  else if (!n.from_store_ids.includes(store.id)) isCanceled = isCanceled || this.cancelAxios(store);
        //});
        // передаём на дебоунс
        this.getSources(n, isCanceled)
      },
    },
  }
</script>

<style scoped>

</style>