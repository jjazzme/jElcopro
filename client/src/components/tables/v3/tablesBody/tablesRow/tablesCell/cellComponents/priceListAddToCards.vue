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
        :title="`${invoiceCount === null ? 'Добавить счёт' : 'В счёт'}`"
      >
        <fa-icon class="p-l-doc" icon="file-invoice-dollar"/>
        <fa-icon
          class="p-l-add"
          v-if="invoiceCount === null"
          :icon="['far', 'question-circle']"
        />
        <div
          v-if="invoiceCount>0"
          class="p-l-count"
        >{{1000000}}</div>
      </div>
    </div>
  </div>


</template>

<script>
  import router from "../../../../../../../router";

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
      invoiceCount(){
        return this.$store.getters['CARDS/GET_GOODS_COUNT_FROM_INVOICE'](this.value.good_id)
      },
      orderCount(){},
    },
    methods:{
      toInvoice(){
        if(this.invoiceCount !== null){
          this.$store.dispatch('CARDS/ADD_LINE_TO_INVOICE', this.value);
        } else{
          router.push({ name: 'tables', params:{ table: 'Invoice' } })
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
          left: 28px;
        }
        .p-l-add{
          font-size: 12px;
          position: absolute;
          top: 3px;
          left: 37px;
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