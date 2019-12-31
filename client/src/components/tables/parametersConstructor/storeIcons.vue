<template>
  <div>
    <span
      v-for="store in value.stores"
      :class="`${store.online ? 'p-l-online' : ''}${value.optics.selectedStores.includes(store.id) ? ' p-l-selected' : ''}${store._loading ? ' p-l-loading' : ''}`"
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
        if(this.value.optics.selectedStores.includes(id)) this.value.optics.selectedStores.splice(_.indexOf(this.value.optics.selectedStores, id), 1);
        else this.value.optics.selectedStores.push(id)
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