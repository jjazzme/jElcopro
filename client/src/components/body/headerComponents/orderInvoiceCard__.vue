<template>
  <div class="s-h-card">
    <b-link
      :to="{name:'tables', params:{ type }}"
      v-if="!id"
    >
      Добавить {{alias}}
    </b-link>

    <div
      v-if="document && documentLines"
    >
      <div class="h-c-close" @click="closeCard()">x</div>
      <router-link
        :to="{name:'item', params:{ type, id }}"
        class="h-c-topic"
      >
        {{alias}} №{{ document.number }} от {{ Intl.DateTimeFormat('ru-RU').format(new Date(document.date)) }}
      </router-link>
      <!--div class="h-c-topic">{{alias}} №{{value.number}} от {{Intl.DateTimeFormat('ru-RU').format(new Date(value.date))}}</div-->
      <div class="h-c-sum">{{ document.amount_with_vat.toFixed(2) }}₽</div>
      <div class="h-c-lines">Строк: {{ document.documentLines ? document.documentLines.length : ''}} | Товаров: {{ count }}</div>
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
        documentLines: null,
      }
    },
    props: {
      value: null,
      id: null,
      type: null,
    },
    computed:{
      count(){ return this.document ? _.sumBy(this.document.documentLines, line => line.quantity) : 0 },
      _document(){ return this.id ? this.value.dataSource.getCacheItem(this.type, this.id) : null; },
      secondPart(){
        return this.type === 'Invoice'
          ? this.document?.buyerable?.party?.name
          : this.document?.sellerable?.party?.name;
      },
    },
    methods:{
      closeCard(){ this.value.dataSource.cardDelete(this.id, this.type) },
      setDocument(val){
        this.$set(this, 'document', val);
        if (val) {
          this.$set(this, 'documentLines', val.documentLines)
        } else {
          this.$set(this, 'documentLines', null)
        }
      },
    },
    created() {
      if (this.type === 'Invoice') this.alias = 'счёт';
      else if (this.type === 'Order') this.alias = 'заказ';

      if (this.id) this.value.dataSource.getSourceById({ type: this.type, id: this.id, check: ['documentLines'] })
      if (this._document) this.setDocument(this._document)
    },
    watch:{
      id(n){
        if (n) this.value.dataSource.getSourceById({ type: this.type, id: this.id, check: ['documentLines']  });
      },
      _document:{
        handler: function(n) {
          this.setDocument(n)
        },
        deep: true
      }
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .s-h-card{
    position: relative;
    min-width: 230px;
    background-color: @table-body-bg;
    border-radius: 10px;
    margin-right: 20px;
    padding: 10px;
    height: 120px;
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
      display: block;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
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
  }
  @media @mob {
    .s-h-card{
      border-radius: 5px;
      margin-right: 10px;
      padding: 0 5px;
      height: auto;
      min-width: 120px;
      .h-c-close{
        display: none;
      }
      .h-c-topic{
      }
      .h-c-sum{
        display: none;
      }
      .h-c-lines{
        display: none;
      }
      .h-c-buyer{
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 13px;
      }
    }
  }
</style>