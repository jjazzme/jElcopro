<template>
  <div>
    <span
      v-for="store in value.references.stores"
      :class="`${store.online ? 'p-l-online' : ''}${value.selectedStores.includes(store.id) ? ' p-l-selected' : ''}${store._loading ? ' p-l-loading' : ''}`"
      :title="`${store.company.party.name} - ${store.name} (${store.online ? 'онлайн' : 'оффлайн'})`"
      @click="selectStore(store.id)"
    >
      {{store.icon}}
    </span>
  </div>
</template>

<script>
  export default {
    name: "storeIcons",
    props: {
      value: null,
    },
    methods:{
      selectStore(id){
        if(this.value.selectedStores.includes(id)) this.value.selectedStores.splice(_.indexOf(this.value.selectedStores, id), 1);
        else this.value.selectedStores.push(id)
      }
    },
  }
</script>

<style scoped lang="less">
  span{
    color: silver;
    cursor: pointer;
    display: inline-block;
    width: 20px;
    text-align: center;
  }
  .p-l-online{border-bottom: solid 1px silver;}
  .p-l-selected{color: black; font-weight: 600;}
  .p-l-online.p-l-loading{border-color: red;}
  .p-l-online:hover, .p-l-selected:hover{color:gray}
</style>