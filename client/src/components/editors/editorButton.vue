<template>
  <div
    class="t-editor"
    @click="editor"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
    ><path fill="currentColor" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path></svg>
  </div>
</template>

<script>
  export default {
    name: "editorButton",
    props: {
      cell: null,
      source: null,
      row: null,
      name: null,
      bodyWidth: null,
      one: null,
      parentType: null,
    },
    methods:{
      editor(e){
        e.preventDefault();
        if(this.cell.editor){
          if (this.source.editor.component) {
            this.source.editor.component = null;
            this.source.editor.transition = null;
            this.source.editor.type = null;
            this.source.editor.one = null;
            this.source.editor.parentType = null;
          } else {
            this.source.editor.component = this.cell.editor;
            this.source.editor.initiator = e.target;
            this.source.editor.row = this.row;
            this.source.editor.name = this.name;
            this.source.editor.one = this.one;
            this.source.editor.parentType = this.parentType;

            const rect = e.target.getBoundingClientRect();
            this.source.editor.top = rect.bottom + 5;
            this.source.editor.bottom = this.bodyHeight - rect.top - 5;
            this.source.editor.left = rect.left;
            this.source.editor.right = this.bodyWidth - rect.right;
          }
        }
      },
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-editor{
    cursor: alias;
    position: absolute;
    top: 5px;
    right: 5px;
    width: 30px;
    height: 30px;
    display: block;
    background-color: @table-header-bg;
    border-radius: 5px;
    > svg{
      margin: 8px;
      display: block;
      width: 14px;
      height: 14px;
      color: white;
    }
  }

</style>