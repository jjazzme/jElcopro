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
      :buttons="buttons"
      v-model="value.dataSource.editor"
    />

    <div class="t-buttons">
      <div class="t-enter">
        <fa-icon icon="step-backward"
           :class="{'t-enabled': buttons.back.enable}"
           @click="buttons.back.action()"
        />
      </div>
      <div class="t-enter">
        <fa-icon icon="step-forward"
           :class="{'t-enabled': buttons.forward.enable}"
           @click="buttons.forward.action()"
        />
      </div>
      <div class="t-enter">
        <fa-icon icon="check"
           :class="{'t-enabled': buttons.enter.enable}"
           @click="buttons.enter.action()"
        />
      </div>
      <div class="t-close">
        <fa-icon icon="times"
           @click="close()"
        />
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "editorCover",
    props: {
      value: null,
    },
    data(){
      return {
        buttons:{
          back: {
            enable: false,
            action: () => {},
          },
          forward: {
            enable: false,
            action: () => {},
          },
          enter: {
            enable: true,
            action: this.enter
          },
          addForm: false,
        },
      }
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
      enter(value){
        if (!this.buttons.enter.enable) return;
        const val = value === undefined ? this.value.dataSource.editor.value : value;
        this.value.dataSource.editor.component = null;
        const item = _.cloneDeep(this.value.dataSource.editor.row);
        if(item[this.value.dataSource.editor.name] !== val){
          item[this.value.dataSource.editor.name] = val;
          const type = this.value.dataSource.type;
          this.value.dataSource.updateItem({ type, item })
        }
      },

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
    display: flex;
    flex-flow: column;
    border: silver 1px solid;
    padding: 10px;
    background-color: rgba(255,255,255,0.9);
    border-radius: 5px;
    min-width: 300px;
    min-height: 300px;
    >div{
      flex: 1 1 auto;
    }
    > .t-close{
      margin: -15px -5px 0 0;
      text-align: right;
      cursor: pointer;
      font-weight: 600;
      flex: 0 0 30px;
    }
    > .t-buttons{
      display: flex;
      flex-flow: row nowrap;
      flex: 0 0 40px;
      > div{
        flex: 1 1 auto;
        font-size: 24px;
        cursor: pointer;
        text-align: center;
      }
      .t-enter{
        color: silver;
        .t-enabled{
          color: green
        }
      }
      .t-close{
        color: red;
      }
    }
  }
</style>