<template>
  <div :class="`p-l-cell p-l-c-${cell.field}`">
    <div
      v-html="cell.alias"
      class="p-l-alias"
    >
    </div>
    <component
      v-bind:is="component"
      v-model="cellHTML"
      class="p-l-value"
    ></component>
    <!--div
      v-html="cellHTML"
      class="p-l-value"
    ></div-->
  </div>
</template>

<script>
  //import addButton from './cellComponents/addButton';
  export default {
    name: "priceListCell",
    data(){
      return{
        component: null,
      }
    },
    props:{
      value: null,
      cell: null,
      quantity: null,
    },
    computed:{
      cellHTML(){
        if (this.cell.html) {
          return this.cell.html(this.value);
        } else if (this.cell.component) {
          return this.quantity;
        } else {
          return this.value[this.cell.field];
        }
      },
    },
    mounted() {
      let component = this.cell.component ? this.cell.component : "priceListStandard";
      this.component = () => import(`./cellComponents/${component}`)
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .p-l-cell:last-child{border-right: none}
  .p-l-cell{
    color: @table-body-text;
    border-right: @card-border;
    flex: 1 1 auto;
    position: relative;
    display: flex;
    //justify-content: center;
    //flex-direction: column;
    //text-align: center;
    .p-l-alias {
      position: absolute;
      font-size: 12px;
      line-height: 12px;
      opacity: 0.5;
      top: 0;
      left: 5px;
    }
    .p-l-value {
      width: 100%;
      height: 100%;
      padding-top: 10px;
    }
  }
  .p-l-c-priceRUR{background-color: #ffcc66;}
  .p-l-c-priceRUR, .p-l-c-vat, .p-l-c-ballance, .p-l-c-average_days {font-size: 24px; font-weight: bold;}
  .p-l-c-name {font-size: 16px; font-weight: bold; background-color: #ff9999}
  .p-l-c-online {font-size: 20px;}
</style>