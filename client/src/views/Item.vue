<template>
  <main v-if="row && value.dataSource.user">
    <h1>{{ h1(row) }}</h1>
    <article v-if="actual">
      <div
        class="t-cell"
        :style="`order: ${cell.order}`"
        v-for="(cell, name) in initial"
        :key="name"
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
          :to="cell.to(row)"
          :class="`t-value ${cell.class ? cell.class : ''}`"
          v-html="cell.html ? cell.html(row) : row[name]"
        />
        <div
          v-else
          :class="`t-value ${cell.class ? cell.class : ''}`"
          v-html="cell.html ? cell.html(row) : row[name]"
        />

        <editor-button
          v-if="cell.editor"
          :cell="cell"
          :source="value.dataSource"
          :row="row"
          :name="name"
          :bodyWidth="value.viewport.width"
        />
      </div>
    </article>
    <page-environment
      :head = "{ title: { main: value.dataSource.getShell.name.one, method: h1(row) } }"
      :foot = "null"
    />
  </main>
</template>

<script>
  import EditorButton from "../components/editors/editorButton";
  export default {
    name: "Item",
    components: {EditorButton},
    props:{
      value: null,
    },
    data(){
      return{
        //row: null,
        initial: null,
        type: this.$route.params.type,
        h1: null,
        actual: false,
      }
    },
    computed: {
      row() { return this.value.dataSource.getCacheItem(this.type, parseInt(this.$route.params.id)) },
    },
    created(){
      this.$set(this.value.dataSource, 'type', this.type);
      this.$set(this, 'initial', this.value.dataSource.getShell.initial);
      this.$set(this, 'h1', this.value.dataSource.getShell.h1);
      this.value.dataSource.getSourceById({ type: this.type, id: parseInt(this.$route.params.id), check: 'documentLines' })
        .then(row => { this.actual = true; })
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-cell{
    position: relative;
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