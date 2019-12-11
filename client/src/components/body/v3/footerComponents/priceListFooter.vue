<template>
  <div class="p-l-additional">
    <div class="p-l-info">
      <span>Всего: {{value.count}}</span>
      <span>Фильтр: {{value.filteredCount}}</span>
      <span>Показано: {{showed}}</span>
    </div>
    <div class="p-l-buttons">
      <b-button
        class="p-l-page-add"
        v-if="value.count>value.depth"
        @click="value.nextPage()"
      >Показать еще</b-button>
      <b-button
        class="p-l-page-1"
        v-if="value.count>value.depth && value.pages>1"
        @click="value.onePage()"
      > 1 стр</b-button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "priceListFooter",
    props: {
      value: null,
    },
    computed: {
      showed(){
        const limit = this.value.depth * this.value.pages;
        const fCount = this.value.filteredCount;
        return limit > fCount ? fCount : limit;
      }
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .p-l-additional{
    margin-top: 10px;
    display: flex;
    .p-l-info{
      width: 67%;
      flex: 1 1 auto;
      display: flex;
      span{
        flex: 1 1 auto;
        align-self: center;
        font-family: 'Montserrat', 'Open Sans', sans-serif;
        font-size: 20px;
        font-weight: 100;
        text-align: center;
        border-right: silver dotted 2px;
      }
      span:last-child{border-right: none;}
    }
    .p-l-buttons{
      width: 33%;
      .p-l-page-add{
        flex: 1 1 auto;
        width: 60%;
        min-width: 100px;
        margin-right: 5%;
      }
      .p-l-page-1{
        flex: 1 1 auto;
        width: 30%;
        min-width: 60px;
        margin-right: 5%;
      }
    }
  }
</style>