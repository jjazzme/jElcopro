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
      }
    },
    computed:{

      //stores(){ return this.model.dataSource.getTableByType('Store') },
    },
    created(){
      //this.model.dataSource.loadTableByType('Store');
    }
  }
</script>

<style scoped>

</style>