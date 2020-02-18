<template>
  <div
    class="t-fr-cell t-cell"
    data-field="_firstCell"
    :style="`min-width: ${width};`"
  >
    <div class="t-content">
      <b-form-checkbox
        size="sm"
        class="d-inline-block pl-4 pr-0"
        v-model="selectRow"
      ></b-form-checkbox>
      <b-dropdown
        text=""
        size="sm"
      >
        <b-dropdown-item>
          <b-link
            @click="docToCard(row)"
            v-if="['Invoice','Order'].includes(value.dataSource.type) && row.status_id === 'formed'"
            class="text-nowrap d-block t-cap"
          >{{toCard.text}}</b-link>

          <b-link
            :to="{ name:'item', params: { type: value.dataSource.type, id:row.id } }"
            class="text-nowrap d-block t-cap"
          > {{ value.dataSource.getShell.name.one }}: карта документа</b-link>

          <b-link
            v-for="item in firstCellMenu"
            :to="item.to(row)"
          >
            {{ item.label }}
          </b-link>

          <b-link
            variant="link"
            @click="deleteRow(row.id)"
            v-if="selectRow"
            class="text-nowrap d-block t-cap"
          >Удалить</b-link>
          <div v-else>Удалить (чекбокс)</div>

        </b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
  export default {
    name: "firstRowCell",
    data(){
      return{
        selectRow: false
      }
    },
    props: {
      value: null,
      ind: null,
      row: null,
      width: null,
      one: null,
      parentType: null,
    },
    computed: {
      firstCellMenu(){ return this.value.dataSource.getShell.firstCell?.menu },
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
      deleteRow(key){
        const parentItem = { type: this.parentType, id: this.one };
        const type = this.value.dataSource.type
        this.value.dataSource.deleteItem({ type, key, parentItem })
        .then(ans => {
          //console.log(ans)
          // TODO: удаление из баскета
        })
      },
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-fr-cell {
    order:-1000000;
    .t-cap::first-letter{
      text-transform: uppercase;
    }
    .t-content{
      display: inline-block;
      white-space: nowrap;
    }
  }
</style>