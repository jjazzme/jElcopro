<template>
  <div>
    <div
      v-if="companyId"
    >
      <b-form-select
        v-if="this.stores"
        v-model="value.value"
        :options="options"
      />
    </div>
    <div
      v-else
    >Сначала выберите {{ chose }}</div>
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
        companyId: null,
        chose: null,
      }
    },
    computed:{
      options(){
        if(!this.stores) return
        return _.orderBy(this.stores.map(item => { return { value: item.id, text: item.name } }), 'text', 'asc');
      },
    },
    created(){
      this.companyId = this.source.type === 'Invoice' ? this.value.row.sellerable_id : this.value.row.buyerable_id;
      this.chose = this.source.type === 'Invoice' ? 'продавца' : 'покупателя';
      if(this.companyId){
        this.value.value = this.value.row[this.value.name];
        this.source.getSourceById({ type: 'Company', id: this.companyId , check: 'stores' })
          .then(ans => {
            this.$set(this, 'stores', ans.stores)
          });
      }
    },
  }
</script>

<style scoped>

</style>