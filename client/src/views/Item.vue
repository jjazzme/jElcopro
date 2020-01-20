<template>
  <main v-if="item && value.dataSource.user">
    <h1>{{ h1(item) }}</h1>
    <article>
      <div
        class="t-cell"
        :style="`order: ${cell.order}`"
        v-for="(cell, name) in row"
        v-if="cell.show === undefined || cell.show === true || ( cell.show && cell.show.item === true )"
      >
        <div class="t-alias" v-html="cell.label" />
        <component
          v-if="cell.component"
          v-bind:is="cell.component"
          v-model="row"
          :class="`t-value ${cell.class ? cell.class : ''}`"
        />
        <router-link
          v-else-if="cell.to"
          :to="cell.to(item)"
          :class="`t-value ${cell.class ? cell.class : ''}`"
          v-html="cell.html ? cell.html(item) : item[name]"
        />
        <div
          v-else
          :class="`t-value ${cell.class ? cell.class : ''}`"
          v-html="cell.html ? cell.html(item) : item[name]"
        />
      </div>
    </article>
    <page-environment
      :head = "{ title: { main: value.dataSource.getShell.name.one, method: h1(item) } }"
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
        h1: null,
      }
    },
    created(){
      this.$set(this.value.dataSource, 'type', this.type);
      this.$set(this, 'row', this.value.dataSource.getShell.initial);
      this.$set(this, 'h1', this.value.dataSource.getShell.h1);
      this.value.dataSource.getSourceById({ type: this.type, id: this.$route.params.id, check: 'documentLines' })
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