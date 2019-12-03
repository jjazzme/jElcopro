<template>
  <div>
    <div class="p-l-key">{{value.label}}</div>
    <div class="p-l-value" v-html="renderValue(ind)"></div>
  </div>
</template>

<script>
  export default {
    name: "itemBodyColumn",
    props: {
      value: null,
      env: null,
      ind: null,
    },
    methods:{
      renderValue(key){
        return this.env.shell.initial[key].html ? this.env.shell.initial[key].html(this.env.document) : this.env.document[key];
      },
    }
  }
</script>

<style scoped lang="less">
  &div{
    line-height: 40px;
    display: flex;
    font-size: 20px;
    .p-l-key{
      min-width: 150px;
    }
    .p-l-value{
      min-width: 50px;
    }
  }

</style>