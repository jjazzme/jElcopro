<template>
  <div :class="`p-l-cell p-l-c-${cell.field}`">
    <div
      v-html="cell.alias"
      class="p-l-alias"
    >
    </div>
    <component
      v-bind:is="component"
      v-model="cellValue"
      :key="`${cellKeyPrefix}_comp`"
      class="p-l-value"
    ></component>
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
      cellKeyPrefix: null
    },
    computed:{
      cellValue(){
        if (this.cell.html) return this.cell.html(this.value);
        else if (this.cell.component) return this.value;
        else return this.value[this.cell.field];
      },
    },
    mounted() {
      let component = this.cell.component ? this.cell.component : "priceListStandard";
      this.component = () => import(`./cellComponents/${component}`);

      //if (this.cell.html) this.$set(this, 'cellHTML', this.cell.html(this.value));
      //else if (this.cell.component) this.$set(this, 'cellHTML', this.value);
      //else this.$set(this, 'cellHTML', this.value[this.cell.field]);
    },
    watch:{
      //value(n,o){
      //  debugger
      //  if (this.cell.html) this.$set(this, 'cellHTML', this.cell.html(this.value));
      //  else if (this.cell.component) this.$set(this, 'cellHTML', this.value);
      //  else this.$set(this, 'cellHTML', this.value[this.cell.field]);
      //}
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
      line-height: 9px;
      opacity: 0.5;
      top: 1px;
      left: 5px;
    }
    .p-l-value {
      width: 100%;
      height: 100%;
      padding-top: 10px;
    }
  }
  .p-l-c-min, .p-l-c-max, .p-l-c-pack, .p-l-c-multiply {min-width:40px}
  .p-l-c-online{max-width: 50px; font-size: 16px}
  .p-l-c-code{max-width: 80px;}
  .p-l-c-_priceRUR{background-color: #ffcc66; height: 100%}
  .p-l-c-_priceRUR, .p-l-c-vat, .p-l-c-ballance, .p-l-c-average_days {font-size: 20px; font-weight: bold;}
  .p-l-c-name {font-size: 16px; font-weight: bold; background-color: #ff9999}
  .p-l-c-vat{max-width: 40px;}
</style>