<template>
  <div
    class="t-cell"
    :style="calculatedStyle"
    :data-field="name"
    @contextmenu="editor"
  >
    <div class="t-content">
      <div
        v-html="cell.label"
        class="t-label"
      />
      <component
        v-if="cell.component"
        v-bind:is="cell.component"
        v-model="row"
        :optics="optics"
        :source="source"
        :class="cell.class ? cell.class : ''"
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
    </div>
  </div>
</template>

<script>
  export default {
    name: "cell",
    props:{
      cell: null,
      name: null,
      row: null,
      optics: null,
      width: null,
      bodyWidth: null,
      source: null,
    },
    computed:{
      calculatedStyle(){
        const width = this.width
          ? this.width > (this.bodyWidth - 100)/2
            ? `${(this.bodyWidth - 100)/2}px`
            : `${this.width}px`
          : 'auto';
        return this.width === null ? '' : `flex: 1 1 auto; width: ${width}; order: ${ this.cell.order }`;
      },
    },
    methods:{
      editor(e){
        e.preventDefault();
        if(this.cell.editor){
          if (this.source.editor.component) {
            this.source.editor.component = null;
            this.source.editor.initiator = null;
            this.source.editor.row = null;
            this.source.editor.name = null;
          } else {
            this.source.editor.component = this.cell.editor;
            this.source.editor.initiator = e.target;
            this.source.editor.row = this.row;
            this.source.editor.name = this.name;

            const rect = e.target.getBoundingClientRect();
            this.source.editor.top = rect.top + rect.height + 5;
            this.source.editor.left = rect.left;

          }
        }
      },
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-cell{
    white-space: nowrap;
    display: inline-block;
    .t-content{
      display: inline-block;
      a{
        border: none;
        text-decoration: underline;
        color: navy;
      }
      .t-label{
        font-size: 10px;
        white-space: nowrap;
      }
      .t-value{
        &::v-deep svg{height: 20px}
        text-align: left;
      }
    }
  }
</style>