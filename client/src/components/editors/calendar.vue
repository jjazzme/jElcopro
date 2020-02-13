<template>
  <div class="t-editor">
    <b-form-input
      size="sm"
      type="date"
      v-model ="date"
      @keypress="keypress"
      ref="input"
    />
    <b-form-input
      size="sm"
      type="time"
      v-model="time"
      @keypress="keypress"
    />

  </div>
</template>

<script>
  export default {
    name: "calendarEditor",
    props:{
      value: null,
    },
    computed:{
      date:{
        get(){
          return this.value.value.split('T')[0]
        },
        set(val){
          const arr =this.value.value.split(/T|Z/);
          this.value.value = `${val}T${arr[1]}Z${arr[2]}`
        },
      },
      time:{
        get(){
          return this.value.value.split('T')[1].split('Z')[0]
        },
        set(val){},
      },
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

  .t-editor{
    display: flex;
    > * {
      flex: 1 1 auto
    }
  }
</style>