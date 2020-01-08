<template>
  <div class="t-fr-cell t-cell">
    <b-form-checkbox
      size="sm"
      class="d-inline-block pl-4 pr-0"
      @change="basketChange(row.id)"
      :checked="includes(row.id)"
    ></b-form-checkbox>
    <b-dropdown
      text=""
      size="sm"
    >
      <b-dropdown-item>
        <b-link
          :to="{ name:'item', params: { type: value.dataSource.type, id:row.id } }"
          class="fa fa-pencil-square text-capitalize text-nowrap d-block"
        > {{ value.dataSource.getShell.name.one }}: карта документа</b-link>
        <b-link
          @click="docToCard(row.id)"
          v-if="['Invoice','Order'].includes(value.dataSource.type)"
          class="fa fa-pencil-square text-nowrap d-block"
        >{{toCard[ind].text}}</b-link>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
  export default {
    name: "firstRowCell",
    props: {
      value: null,
      ind: null,
      row: null,
    },
    computed: {
      toCard(){
        const type = this.value.dataSource.getTable.type;
        let ret = [];
        const ids = type==='Invoice'
          ? [this.value.dataSource.user.cards.invoice]
          : this.value.dataSource.user.cards.orders;
        const sellers = type==='Invoice' ? [] : _.map(this.value.dataSource.user.cards.orders, row => row.sellerable_id);

        _.forEach(this.value.dataSource.getTable.loadProcessor.data.rows, row=>{
          let action, text;
          if (ids.includes(row.id)){
            action = 'remove';
            text = 'Удалить из карты'
          } else if (type==='Invoice' && ids[0] && ids[0] !== row.id){
            action = 'change';
            text = 'Заменить в карте'
          } else if (type==='Invoice' && !ids[0]){
            action = 'add';
            text = 'Добавить в карту'
          } else if (type==='Order' && sellers.includes(row.sellerable_id)){
            action = 'change';
            text = 'Заменить в картах'
          } else if (type==='Order' && !sellers.includes(row.sellerable_id)){
            action = 'add';
            text = 'Добавить в карты'
          }
          ret.push({action, text})
        });
        return ret;
      },
    },
    methods: {
      docToCard(id){
        console.log(id)
      },
      basketChange(id){
        console.log('BC', id)
      },
      includes(id){

      },
    },
  }
</script>

<style scoped lang="less">
  .t-fr-cell {
    min-width: 70px; max-width: 70px; order:-1000000;
  }
</style>