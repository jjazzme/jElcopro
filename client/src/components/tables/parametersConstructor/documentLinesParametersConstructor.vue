<template>
  <table-parameters-constructor
    v-model="value"
    :gtCalculated="gtCalculated"
    :isLinear="isLinear"
  />
</template>

<script>
  import TableParametersConstructor from "./tableParametersConstructor";
  export default {
    name: "documentLinesParametersConstructor",
    components: {TableParametersConstructor},
    props:{
      value: null,
      gtCalculated: null,
      isLinear: null,
    },
    created(){
      const document_id = parseInt(this.$route.params.id)
      const optics = this.value.dataSource.getTable.optics.value;
      optics.where = { document_id };
    }
  }
</script>

<style scoped>

</style>