<template>
  <div class="t-editor">
    <b-form-input
      size="sm"
      type="number"
      v-model.number="value.value"
      @keypress="keypress"
      ref="input"
    />
  </div>
</template>

<script>
  export default {
    name: "integerEditor",
    props:{
      value: null,
    },
    methods:{
      keypress(e){
        if(e.code === 'Enter') this.$parent.enter();
      },
    },
    created(){
      this.value.value = this.value.row[this.value.name];
    },
    mounted(){
      this.$refs.input.$el.focus();
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
/*
  .t-editor{
    display: flex;
    > * {
      flex: 1 1 auto
    }
  }

 */
</style>