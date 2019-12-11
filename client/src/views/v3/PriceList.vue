<template>
  <article>
    <price-list-parameters-constructor
      v-if="1===2"
    />
  </article>
</template>

<script>
  import PriceListParametersConstructor
    from "../../components/tables/v2/serverSideParametersConstructor/priceListParametersConstructor";
  export default {
    name: "PriceList",
    components: {PriceListParametersConstructor},
    props: {
      model: null,
    },
    data(){
      return{
        //stores: null,
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