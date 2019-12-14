<template>
  <div class="s-h-card">
    <b-link
      :to="{name:'tables', params:{ type }}"
      v-if="!id"
    >
      Добавить {{alias}}
    </b-link>
    <div
      v-if="document"
    >
      <div class="h-c-close" @click="closeCard()">x</div>
      <router-link
        :to="{name:'modelItem', params:{ type, id }}"
        class="h-c-topic"
      >
        {{alias}} №{{ document.number }} от {{ Intl.DateTimeFormat('ru-RU').format(new Date(document.date)) }}
      </router-link>
      <!--div class="h-c-topic">{{alias}} №{{value.number}} от {{Intl.DateTimeFormat('ru-RU').format(new Date(value.date))}}</div-->
      <div class="h-c-sum">{{ sum.toFixed(2) }}₽</div>
      <div class="h-c-lines">Строк: {{ value.documentLines.length }} | Товаров: {{ count }}</div>
      <div class="h-c-buyer" :title="secondPart">{{ secondPart }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "orderInvoiceCard",
    data(){
      return{
        alias: null,
        document: null,
        sum: 0,
        count: 0,
      }
    },
    props: {
      value: null,
      id: null,
      type: null,
    },
    computed:{
      secondPart(){
        return this.value._type === 'invoice'
          ? document?.buyerable?.party?.name
          : document?.sellerable?.party?.name;
      },
    },
    methods:{
      closeCard(){
        if(this.value._type === 'invoice'){
          this.$store.dispatch('CARDS/INVOICE_REMOVE')
        } else {
          this.$store.dispatch('CARDS/ORDER_REMOVE', this.value.id)
        }
      }
    },
    created() {
      if (this.type === 'invoice') this.alias = 'счёт';
      else if (this.value._type === 'order') this.alias = 'заказ';

      if (this.id) this.$store.dispatch('Binder/getItem', { type: this.type, payload: { id: this.id } })
        .then(doc => this.document=doc)
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .s-h-card{
    .h-c-close{
      color: red;
      cursor: pointer;
      font-weight: 600;
      position: absolute;
      top:0;
      right: 5px;
    }
    .h-c-topic{
      text-align: center;
      width: 100%;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .h-c-sum{
      font-size: 20px;
      font-weight: 600;
      margin-top: 10px;
    }
    .h-c-lines{
      font-size: 12px;
      margin-top: 10px;
    }
    .h-c-buyer{
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 12px;
    }

    position: relative;
    min-width: 230px;
    height: 120px;
    background-color: @table-body-bg;
    padding: 10px;
    border-radius: 10px;
    margin-right: 20px;
  }
</style>