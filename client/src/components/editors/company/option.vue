<template>
  <div
    :class="{ 't-option': true, 't-notactive': !cells.active, 't-last': last}"
    @mouseenter="mouse"
    @click="enter"
  >
    <div class="t-name">{{ cells.name }}</div>
    <div class="t-add">{{ cells.inn }} / {{ cells.ogrn }}</div>
  </div>
</template>

<script>
  export default {
    name: "optionComponent",
    props:{
      row: null,
      type: null,
      last: false,
      ind: null,
      cursor: null,
    },
    computed:{
      cells(){
        const name = this.type === 'db' ? this.row.party.name : this.row.value;
        const inn = this.type === 'db' ? this.row.party.inn : this.row.data.inn;
        const ogrn = this.type === 'db' ? this.row.party.ogrn : this.row.data.ogrn;
        const active = this.type === 'db' ? true : this.row.data.state.status === 'ACTIVE';
        return { name, inn, active, ogrn }
      }
    },
    methods:{
      mouse(){
        this.$set(this.cursor, 'type', this.type);
        this.$set(this.cursor, 'position', this.ind);
      },
      enter(){
        this.$parent.$parent.enter();
      },
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-option{
    cursor: pointer;
    display: flex;
    flex-flow: column nowrap;
    border-bottom: 1px solid silver;
    > div{
      padding: 0 5px;
    }
    .t-add{
      font-size: 12px;
    }
  }
  .t-last{
    border-bottom: none;
  }
  .t-notactive{
    text-decoration: line-through;
    color: silver;
  }

</style>