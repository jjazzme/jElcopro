<template>
  <div class="t-fr-cell t-cell" data-field="_firstRow">
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
          @click="docToCard(row)"
          v-if="['Invoice','Order'].includes(value.dataSource.type)"
          class="fa fa-pencil-square text-nowrap d-block"
        >{{toCard.text}}</b-link>
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
        const type = this.value.dataSource.type;
        if(!['Invoice','Order'].includes(this.value.dataSource.type)) return null;
        const ids = type==='Invoice'
          ? [this.value.dataSource.user.cards.invoice]
          : this.value.dataSource.user.cards.orders;
        const sellers = type==='Invoice' ? [] : _.map(this.value.dataSource.getOrders, row => row.sellerable_id);

        let action, text;
        if (ids.includes(this.row.id)){
          action = 'remove';
          text = 'Удалить из карты'
        } else if (type==='Invoice' && ids[0] && ids[0] !== this.row.id){
          action = 'change';
          text = 'Заменить в карте'
        } else if (type==='Invoice' && !ids[0]){
          action = 'add';
          text = 'Добавить в карту'
        } else if (type==='Order' && sellers.includes(this.row.sellerable_id)){
          action = 'change';
          text = 'Заменить в картах'
        } else if (type==='Order' && !sellers.includes(this.row.sellerable_id)){
          action = 'add';
          text = 'Добавить в карты'
        }
        return { action, text }
      },
    },
    methods: {
      docToCard(row){
        const sou = this.value.dataSource;
        const type = sou.type;
        const action = this.toCard.action;
        if (action === 'add') sou.cardAdd(row.id, type);
        else if (action === 'remove') sou.cardDelete(row.id, type);
        else sou.cardChange(row, type)

      },
      basketChange(id){
        console.log('BC', id)
      },
      includes(id){ //basket

      },
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-fr-cell {
    width: 70px; max-width: 70px;
    order:-1000000;
  }
</style>