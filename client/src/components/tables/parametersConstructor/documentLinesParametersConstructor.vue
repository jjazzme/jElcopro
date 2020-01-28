<template>
  <div
    v-if="row"
  >
    <h1>{{ h1(row) }}</h1>
    <div class="t-additional">
      <div>Сумма с НДС: {{ row ? row.amount_with_vat : '-' }}р.</div>
      <div>
        Статус :
        <b-button
          v-if="row"
          variant="link"
          @click="editor"
        >{{ initial.status_id.html(row) }}</b-button>
      </div>
      <div
        v-if="childrenShell.Model && childrenShell.Model.children"
      >
        Создать
        <b-button
          variant="link"
          @click="makeChildren"
        >
          {{ childrenShell.name.one }}
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
  import TableParametersConstructor from "./tableParametersConstructor";
  export default {
    name: "documentLinesParametersConstructor",
    components: {TableParametersConstructor},
    props:{
      value: null,
    },
    data(){
      return{
        initial: null,
        transition: null,
        parentType: this.$route.params.parentType,
        h1: null,
      }
    },
    computed:{
      row() { return this.value.dataSource.getCacheItem(this.parentType, parseInt(this.$route.params.id)) },
      childrenShell(){
        const from = this.value.dataSource.shells.template[this.parentType].Model.children;
        return this.value.dataSource.shells.template[from];
      }
    },
    methods:{
      makeChildren(){
        this.value.dataSource.runProcedure({ type: 'makeChildren', params: { for: this.parentType, id: parseInt(this.$route.params.id), to: this.value.dataSource.shells.template[this.parentType].Model.children } })
          .then(ans => {
            const type = this.value.dataSource.shells.template[this.parentType].Model.children;
            this.$router.push({ name: 'item', params: { type, id: ans.data[type][0].id } })
          });
      },
      editor(e){
        e.preventDefault();
        if(this.initial.status_id.editor){
          if (this.value.dataSource.editor.component) {
            this.value.dataSource.editor.component = null;
            this.value.dataSource.editor.transition = null;
            this.value.dataSource.editor.type = null;
          } else {
            this.value.dataSource.editor.component = this.initial.status_id.editor;
            this.value.dataSource.editor.initiator = e.target;
            this.value.dataSource.editor.row = this.row;
            this.value.dataSource.editor.name = 'status_id';
            this.value.dataSource.editor.transition = this.transition;
            this.value.dataSource.editor.type = this.parentType;

            const rect = e.target.getBoundingClientRect();
            this.value.dataSource.editor.top = rect.bottom + 5;
            this.value.dataSource.editor.bottom = this.value.viewport.height - rect.top - 5;
            this.value.dataSource.editor.left = rect.left;
            this.value.dataSource.editor.right = this.value.viewport.width - rect.right;
          }
        }
      },
    },
    created(){
      const parentShell = this.value.dataSource.shells.template[this.parentType];
      this.$set(this, 'initial', parentShell.initial);
      this.$set(this, 'transition', parentShell.transition);
      this.value.dataSource.getSourceById({ type: this.parentType, id: parseInt(this.$route.params.id), check: 'documentLines' });
      this.$set(this, 'h1', parentShell.h1);

    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-additional{
    display: flex;
    flex-flow: row;
    > div{
      margin: 0 0 0 10px;
      padding: 0 10px;
      border-right: 1px solid gray;
      button{
        padding: 0 20px;
        vertical-align: top;
      }
    }
    > div:last-child{ border: none; }
  }

</style>