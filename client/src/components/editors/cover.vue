<template>
  <div
    :style="style"
    class="t-e-cover"
  >
    <div
      class="t-close"
      @click="close()"
    >
      x
    </div>

    <component
      v-bind:is="value.dataSource.editor.component"
      :source="value.dataSource"
      v-model="value.dataSource.editor"
    />
  </div>
</template>

<script>
  export default {
    name: "editorCover",
    props: {
      value: null,
    },
    computed:{
      style(){
        let vertical = 'top';
        let horizontal = 'right';
        let vVal = this.value.dataSource.editor[vertical];
        let hVal = this.value.dataSource.editor[horizontal];
        return `${ vertical }: ${ vVal }px; ${ horizontal }: ${ hVal }px`;
      }
    },
    methods:{
      close(){
        this.value.dataSource.editor.component = null;
        this.value.dataSource.editor.initiator = null;
        this.value.dataSource.editor.row = null;
        this.value.dataSource.editor.name = null;
        this.value.dataSource.editor.transition = null;
        this.value.dataSource.editor.type = null;
      }
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-e-cover{
    z-index: 999;
    position: absolute;
    border: silver 1px solid;
    padding: 10px;
    background-color: rgba(255,255,255,0.9);
    border-radius: 5px;
    .t-close{
      margin: -15px -5px 0 0;
      text-align: right;
      cursor: pointer;
      font-weight: 600;
    }
  }
</style>