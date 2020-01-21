<template>
  <div class="t-editor">
    <b-form-input
      size="sm"
      type="number"
      v-model.number="_value"
      @keypress="keypress"
    />
    <b-button
      size="sm"
      @click="enter()"
    >
      ok
    </b-button>
  </div>
</template>

<script>
  export default {
    name: "integerEditor",
    props:{
      source: null,
      value: null,
    },
    data(){
      return{
        _value: 0
      }
    },
    methods:{
      keypress(e){
        if(e.code === 'Enter') this.enter();
      },
      enter(){
        this.value.component = null;
        const item = _.cloneDeep(this.value.row);
        if(item[this.value.name] !== this._value){
          item[this.value.name] = this._value;
          const type = this.source.type;
          this.source.updateItem({ type, item })
        }
      }
    },
    created(){
      this._value = this.value.row[this.value.name];
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-editor{
    display: flex;
    > * {
      flex: 1 1 auto
    }
  }
</style>