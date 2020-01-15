<template>
  <div class="t-cell">
    <b-form-input
      class="t-input"
      size="sm"
      type="number"
      min="1"
      :max="optics.quantity"
      v-model.number="value._realCount"
      :formatter="intFormatter"
      placeholder="Мин количество"
    />
    по
    <b-form-input
      class="t-input"
      size="sm"
      type="number"
      :min="value._priceRUR"
      :max="200*value._priceRUR"
      v-model.number="value.for_all_price"
    />
    (
    <b-form-input
      class="t-input"
      size="sm"
      type="number"
      :min="0"
      :max="200"
      v-model.number="markup"
    />
    )
    <div class="t-vectors">
      <div
        @click="toInvoice"
        :title="`${invoice ? 'В счёт' : 'Добавить счёт'}`"
      >
        <fa-icon class="t-doc" icon="file-invoice-dollar"/>
        <fa-icon
          class="t-add"
          v-if="!invoice"
          :icon="['far', 'question-circle']"
        />
      </div>
      <div
        @click="toOrder"
        :title="`${order ? 'В заказ' : 'Добавить заказ'}`"
      >
        <fa-icon class="t-doc" :icon="['fab', 'codepen']"/>
        <fa-icon
          class="t-add"
          v-if="!order"
          :icon="['far', 'question-circle']"
        />
      </div>
      <div
        v-if="order && invoice"
        @click="toBoth"
        title="В карты"
        class="t-both"
      >
        <fa-icon class="t-doc" icon="file-invoice-dollar"/>
        <fa-icon class="t-doc" :icon="['fab', 'codepen']"/>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "priceListAddToCard",
    data(){
      return{
        //quantity: this.value._realCount,
        actions: {invoice: false, order: false},
        user: this.$store.getters['User/getUser'],
        //invoice: null,
        //order: null,
      }
    },
    props:{
      value: null,
      optics: null,
      source: null,
    },
    computed:{
      markup:{
        get(){
          return parseFloat((this.value.for_all_price/this.value._priceRUR - 1).toFixed(4) * 100)
        },
        set(val){
          //this.markup = val;
          this.value.for_all_price = parseFloat((this.value._priceRUR * (1 + val/100)).toFixed(2))
        }
      },
      invoice(){
        return this.source.getInvoice;
      },
      order(){
        const orders = this.source.getOrders;
        return orders.find(order => order.sellerable_id === this.value.company_id)
      }
    },
    methods:{
      toBoth(){
        this.toInvoice();
        this.toOrder();
      },
      toInvoice(){
        if(this.invoice){
          this.$store.dispatch('Binder/addLineToDocument', { priceLine: this.value, ourPrice: false, documentId: this.value.id });
        } else{
          this.$router.push({ name: 'tables', params:{ type: 'Invoice' } })
        }
      },
      toOrder(){
        if(this.order){
          this.$store.dispatch('Binder/addLineToDocument', { priceLine: this.value, ourPrice: true, documentId: this.value.id });
        } else{
          this.$router.push({ name: 'tables', params:{ type: 'Order' } })
        }
      },
      intFormatter(val, e){
        let ret = parseInt(val);
        if (!ret) ret = 1;
        if (ret > this.optics.quantity) ret = this.optics.quantity;
        return parseInt(ret);
      },
    },
    created(){
      /*
      if (this.user.cards.invoice) this.$set(this, 'invoice', this.$store.getters['Binder/cacheGetItem']('Invoice', this.user.cards.invoice));
      const sid = this.value.company_id;
      const orders = _.map(this.user.cards.orders, id => this.$store.getters['Binder/cacheGetItem']('Order', id));
      const filtered = orders.filter(order => sid === order.sellerable_id);
      if (filtered.length === 1) this.$set(this, 'order', filtered[0]);

       */
    },
  }
</script>

<style scoped lang="less">
  .t-cell{
    display: flex;
    flex-flow: row nowrap;
    .t-input{
      margin: 0 5px;
      color: navy;
      height: 28px;
      background-color: white;
      width: auto;
      padding: 0 1px;
      font-size: 1.2em;
      text-align: center;
      border: none;

      font-weight: 600;
      display: inline-block;
    }
    .t-vectors{
      display: flex;
      flex-flow: row nowrap;
      >div{
        cursor: pointer;
        width: 30px;
        height: 30px;
        position: relative;
        display: inline-block;
        .t-doc{
          color: gray;
          font-size: 20px;
          position: absolute;
          top: 4px;
          left: 2px;
        }
        .t-add{
          font-size: 12px;
          position: absolute;
          top: -3px;
          left: 30px;
          color: red
        }
        .t-count{
          font-size: 6px;
          line-height: 8px;
          height: 8px;
          position: absolute;
          top: -4px;
          left: 0;
          color: black;
        }
      }
      .t-both{
        svg{font-size: 16px}
        svg:first-child{left: 5px; top: 7px}
        svg:last-child{top: 0; left: 16px}
      }
    }
  }
</style>