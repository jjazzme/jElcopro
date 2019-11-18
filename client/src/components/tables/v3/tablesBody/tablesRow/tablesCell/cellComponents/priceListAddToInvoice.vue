<template>
  <b-button
    variant="link"
    @click="addToInvoice"
  >
    +{{value._realCount}}
  </b-button>
</template>

<script>
  export default {
    name: "priceListAddToInvoice",
    props:{
      value: null,
    },
    methods:{
      addToInvoice(){
        this.$store.dispatch('CARDS/ADD_LINE_TO_INVOICE', this.value);
      },
    }
  }
</script>

<style scoped>

</style>