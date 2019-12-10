<template>
  <article>
    <price-list-parameters-constructor

    />
  </article>
</template>

<script>
  import PriceListParametersConstructor
    from "../../components/tables/v2/serverSideParametersConstructor/priceListParametersConstructor";
  export default {
    name: "PriceList",
    components: {PriceListParametersConstructor}
  }
</script>

<style scoped>

</style>