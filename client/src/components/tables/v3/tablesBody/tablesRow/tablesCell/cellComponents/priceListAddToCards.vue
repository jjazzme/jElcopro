<template>
  <div class="component">
    <b-form-input
      class="p-l-input"
      size="sm"
      type="number"
      min="1"
      :max="value._realCount"
      v-model="quantity"
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
  //import router from "../../../../../../../router";

  export default {
    name: "priceListAddToCards",
    data(){
      return{
        quantity: this.value._realCount,
        actions: {invoice: false, order: false}
      }
    },
    props:{
      value: null,
    },
    computed:{
      invoice(){return this.$store.getters['CARDS/GET_INVOICE'];},
      order(){
        const sid = this.value.company_id;
        const orders = this.$store.getters['CARDS/GET_ORDERS'];
        const ind = _.findIndex(orders, item=>sid===item.sellerable_id);
        return ind>=0 ? this.$store.getters['CARDS/GET_ORDERS'] : null;
      },
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
          this.$router.push({ name: 'tables', params:{ table: 'Invoice' } })
        }
      },
      toOrder(){
        if(this.order){
          this.$store.dispatch('CARDS/ADD_LINE_TO_DOCUMENT', { priceLine: this.value, type: 'order' });
        } else{
          this.$router.push({ name: 'tables', params:{ table: 'Order' } })
        }
      },
      intFormatter(val, e){
        let ret = parseInt(val);
        if (!ret) ret = 1;
        if (ret>this.value._realCount) ret = this.value._realCount;
        return parseInt(ret);
      },
    }
  }
</script>

<style scoped lang="less">
  .component{
    position: relative;
    .p-l-vectors{

      position: absolute;
      top: 3px;
      left: 100px;
      >div{
        cursor: pointer;
        width: 50px;
        height: 30px;
        position: relative;
        display: inline-block;
        .p-l-doc{
          color: gray;
          font-size: 20px;
          position: absolute;
          top: 10px;
          left: 18px;
        }
        .p-l-add{
          font-size: 12px;
          position: absolute;
          top: 3px;
          left: 30px;
          color: red
        }
        .p-l-count{
          font-size: 6px;
          line-height: 8px;
          height: 8px;
          position: absolute;
          top: 2px;
          left: 0;
          color: black;
        }
      }
      .p-l-both{
        svg{font-size: 16px}
        svg:first-child{left: 17px; top: 12px}
        svg:last-child{top: 5px; left: 28px}
      }
    }
    .p-l-input{
      position: absolute;
      color: navy;
      height: 22px;
      top: 12px;
      left: 0;
      background-color: transparent;
      width: 100px;
      padding: 0 1px;
      margin: 0;
      font-size: 1.3em;
      text-align: center;
      border: none;
      font-weight: 600;
      display: inline-block;
    }
  }
</style>