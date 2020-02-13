<template>
  <div
    :class="{ 't-cell': true, 't-editable': cell.editor }"
    :style="calculatedStyle"
    :data-field="name"
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
        :class="`t-value ${ cell.class ? cell.class : '' }`"
        v-html="cell.html ? cell.html(row) : row[name]"
      />
    </div>
    <editor-button
      v-if="cell.editor"
      :cell="cell"
      :source="source"
      :row="row"
      :name="name"
      :bodyWidth="bodyWidth"
    />
  </div>
</template>

<script>
  import EditorButton from "../editors/editorButton";
  export default {
    name: "cell",
    components: {EditorButton},
    props:{
      cell: null,
      name: null,
      row: null,
      optics: null,
      width: null,
      bodyWidth: null,
      bodyHeight: null,
      source: null,
    },
    computed:{
      calculatedStyle(){
        const width = this.width
          ? this.width > (this.bodyWidth - 100)/2
            ? `${(this.bodyWidth - 100)/2}px`
            : `${this.width}px`
          : 'auto';
        return `min-width: ${width}; order: ${ this.cell.order }`;
      },
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-cell{
    //white-space: nowrap;
    //display: inline-block;
    display: flex;
    flex-flow: row nowrap;
    flex: 1 1 auto;
    position: relative;
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
  .t-editable{ //t-cell
    > .t-content{
      padding-right: 40px;
    }
  }
</style>