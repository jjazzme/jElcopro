<template>
  <div class="s-h-invoice">
    <b-link
      :to="{name:'tables', params:{table:'Invoice'}}"
      v-if="!value"
    >
      Добавить счёт
    </b-link>
    <div
      v-else
    >
      <div class="h-i-close" @click="closeInvoice()">x</div>
      <div class="h-i-topic">Счёт №{{invoice.number}} от {{Intl.DateTimeFormat('ru-RU').format(new Date(invoice.date))}}</div>
      <div class="h-i-sum">{{invoice._sum}}₽</div>
      <div class="h-i-lines">Строк: {{invoice.documentLines.length}} | Товаров: {{invoice._count}}</div>
      <div class="h-i-buyer" :title="invoice.buyerable.party.name">{{invoice.buyerable.party.name}}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "orderInvoiceCard",
    props: {
      value: null,
    },
    computed:{
      docType(){return this.value.}
    },
  }
</script>

<style scoped>

</style>