<template>
  <div class="t-selector">
    <div
      v-for="(item, ind) in data"
      :class="{ 't-option': true, 't-selected': ind === cursor.value }"
      v-on:mouseover="mouse"
      @click="enter(item)"
      :data-ind="ind"
    >
      {{ item.unrestricted_value  }}
    </div>
  </div>
</template>

<script>
  export default {
    name: "selectAddress",
    props:{
      data: null,
      cursor: null,
      value: null,
    },
    data(){
      return {
      }
    },
    computed:{
    },
    methods:{
      mouse: function(e){
        this.cursor.value = parseInt($(e.target).attr('data-ind'));
      },
      enter(val){
        this.value.address = val.unrestricted_value;
        this.value.json = val;
      }
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .t-selector{
    padding-top: 10px;
  }
  .t-selected{
    background-color: @table-header-bg;
    color: @table-header-text;
  }
  .t-option{
    max-width: 300px;
    cursor: pointer;
    border-bottom: 1px solid silver;
    padding: 2px 0;
  }

</style>