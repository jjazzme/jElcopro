<template>
  <div>
    <b-form-select
      v-model="value.value"
      :options="options"
    />
  </div>
</template>

<script>
  export default {
    name: "currency",
    props: {
      value: null,
      source: null,
      buttons: null,
    },
    computed:{
      options(){
        const sou = this.source.getCache('Currency');
        return _.orderBy(sou.map(item => { return { value: item.id, text: item.name } }), 'text', 'asc');
      },
    },
    created(){
      this.value.value = this.value.row[this.value.name];
    },

  }
</script>

<style scoped>

</style>