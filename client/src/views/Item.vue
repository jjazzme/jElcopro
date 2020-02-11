<template>
  <main v-if="actual">
    <h1>{{ h1(row) }}</h1>
    <article>
      <div>
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
      </div>
      <div
        class="t-add"
        v-if="parseInt(this.$route.params.id) === 0"
      >
        <b-button
          @click="add"
          :disabled="addDisabled"
        >Добавить</b-button>
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
        //type: this.$route.params.type,
        h1: null,
        actual: false,
        newItem: null,
        addDisabled: false,
      }
    },
    computed: {
      row() { return parseInt(this.$route.params.id) === 0 ? this.newItem  : this.value.dataSource.getCacheItem(this.type, parseInt(this.$route.params.id)); },
      type(){ return this.$route.params.type },
      id(){ return this.$route.params.id }
    },
    methods: {
      add(){
        this.$set(this, 'addDisabled', true);
        this.value.dataSource.updateItem({ type: this.type, item: this.row })
        .then(ans => {
          this.$router.replace({ name: 'item', params:{ type: this.type, id: ans.data.id } })
        })
        .catch(() => {
          this.$set(this, 'addDisabled', false);
        })
      },
      init(){
        this.actual = false;
        this.$set(this.value.dataSource, 'type', this.type);

        this.$set(this, 'initial', this.value.dataSource.getShell.initial);

        if (parseInt(this.$route.params.id) === 0){
          this.$set(this, 'newItem', _.cloneDeep(this.value.dataSource.getShell.newItem));
          this.newItem.user = this.value.dataSource.getUser;
          this.newItem.user_id = this.newItem.user.id;
          this.$set(this, 'h1', () => `Новый ${ this.value.dataSource.getShell.name.one }`);
          this.actual = true;
        } else {
          this.value.dataSource.getSourceById({ type: this.type, id: parseInt(this.$route.params.id), check: ['documentLines', 'selerable', 'buyerable'] })
            .then(row => { this.actual = true; })
          this.$set(this, 'h1', this.value.dataSource.getShell.h1);
        }

      },
    },
    created(){
      this.init();
    },
    watch:{
      type(n){
        this.init();
      },
      id(n){
        this.init();
      }
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .t-add{
    text-align: center;
    margin-top: 20px;
  }
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