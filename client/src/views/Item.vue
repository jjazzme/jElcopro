<template>
  <main v-if="item && value.dataSource.user">
    <h1>{{ h1 }}</h1>
    <article>
      <div
        class="t-cell"
        v-for="(cell, name) in row"
      >
        <div class="t-alias" v-html="cell.label" />
        <component
          v-if="cell.component"
          v-bind:is="cell.component"
          v-model="row"
          :class="`t-value ${cell.class ? cell.class : ''}`"
        />
        <div
          v-else
          :class="`t-value ${cell.class ? cell.class : ''}`"
          v-html="cell.html ? cell.html(item) : item[name]"
        />
      </div>
    </article>
    <page-environment
      :head = "{ title: { main: value.dataSource.getShell.name.one, method: h1 } }"
      :foot = "null"
    />
  </main>
</template>

<script>
  export default {
    name: "Item",
    props:{
      value: null,
    },
    data(){
      return{
        item: null,
        row: null,
        type: this.$route.params.type,
      }
    },
    computed:{
      h1(){ return this.item?.name } // TODO: предусмотреть любое поле для h1
    },
    created(){
      this.$set(this.value.dataSource, 'type', this.type);
      const type = this.type;
      const id = this.$route.params.id;
      this.row = this.value.dataSource.getShell.initial;
      this.value.dataSource.getSourceById({ type, id })
        .then(item => this.$set(this, 'item', item))
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-cell{
    width: 100%;
    max-width: 1200px;
    display: flex;
    margin: 0 auto;
    flex-flow: row wrap;
    .t-alias, .t-value{
      flex: 1 1 auto;
      width: calc(50% - 4px);
      background-color: @table-body-bg;
      margin: 2px;
      padding: 5px;
    };
    .t-alias{
      text-align: right;
      padding-right: 20px;
      font-weight: 600;
    }
  }
</style>