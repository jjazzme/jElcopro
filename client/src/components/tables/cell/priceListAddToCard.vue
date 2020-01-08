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
    <div class="p-l-vectors">
      <div
        @click="toInvoice"
        :title="`${invoice ? 'В счёт' : 'Добавить счёт'}`"
      >
        <fa-icon class="p-l-doc" icon="file-invoice-dollar"/>
        <fa-icon
          class="p-l-add"
          v-if="!invoice"
          :icon="['far', 'question-circle']"
        />
      </div>
      <div
        @click="toOrder"
        :title="`${order ? 'В заказ' : 'Добавить заказ'}`"
      >
        <fa-icon class="p-l-doc" :icon="['fab', 'codepen']"/>
        <fa-icon
          class="p-l-add"
          v-if="!order"
          :icon="['far', 'question-circle']"
        />
      </div>
      <div
        v-if="order && invoice"
        @click="toBoth"
        title="В карты"
        class="p-l-both"
      >
        <fa-icon class="p-l-doc" icon="file-invoice-dollar"/>
        <fa-icon class="p-l-doc" :icon="['fab', 'codepen']"/>
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
        user: this.$store.getters['Auth/getUser'],
        invoice: null,
        order: null,
      }
    },
    props:{
      value: null,
      optics: null,
    },
    computed:{

    },
    methods:{
      toBoth(){
        this.toInvoice();
        this.toOrder();
      },
      toInvoice(){
        if(this.invoice){
          this.$store.dispatch('CARDS/ADD_LINE_TO_DOCUMENT', { priceLine: this.value, type: 'invoice' });
        } else{
          this.$router.push({ name: 'tables', params:{ type: 'Invoice' } })
        }
      },
      toOrder(){
        if(this.order){
          this.$store.dispatch('CARDS/ADD_LINE_TO_DOCUMENT', { priceLine: this.value, type: 'order' });
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
      if (this.user.cards.invoice) this.$set(this, 'invoice', this.$store.getters['Binder/cacheGetItem']('Invoice', this.user.cards.invoice));
      const sid = this.value.company_id;
      const orders = _.map(this.user.cards.orders, id => this.$store.getters['Binder/cacheGetItem']('Order', id));
      const filtered = orders.filter(order => sid === order.sellerable_id);
      if (filtered.length === 1) this.$set(this, 'order', filtered[0]);
    },
  }
</script>

<style scoped>

</style>