<template>
  <div>
    <div>
      <b-form-select
        v-if="this.stores"
        v-model="value.value"
        :options="options"
      />
    </div>
  </div>
</template>

<script>
  export default {
    name: "companyStore",
    props: {
      value: null,
      source: null,
      buttons: null,
    },
    data(){
      return{
        stores: null,
      }
    },
    computed:{
      options(){
        if(!this.stores) return
        return _.orderBy(this.stores.map(item => { return { value: item.id, text: item.name } }), 'text', 'asc');
      },
    },
    created(){
      this.value.value = this.value.row[this.value.name];
      this.source.getSourceById({ type: 'Company', id: this.value.row.store.company_id, check: 'stores' })
      .then(ans => {
        this.$set(this, 'stores', ans.stores)
      });
    },
  }
</script>

<style scoped>

</style>