<template>
  <div class="t-editor">
    <b-button
      variant="link"
      v-if="back.length !== 0"
      @click="change(back[0].name)"
    >
      << {{ aliases[back[0].to] || back[0].to }}
    </b-button>

    <div
      v-if="additional.length !== 0"
    >
      <b-button
        variant="link"
        v-for="(item, ind) in additional"
        :key="ind"
        @click="change(item.name)"
      >
        {{ item.name }}
      </b-button>
    </div>

    <b-button
      variant="link"
      v-if="forward.length !== 0"
      @click="change(forward[0].name)"
    >
      {{ aliases[forward[0].to] || forward[0].to }} >>
    </b-button>
  </div>
</template>

<script>
  export default {
    name: "documentStatus",
    props:{
      source: null,
      value: null,
      buttons: null,
    },
    data(){
      return{
        aliases: {
          formed: 'формируется',
          reserved: 'зарезервирован',
          in_work: 'в работе',
          closed: 'закрыт'
        }
      }
    },
    computed:{
      _value() { return this.value.row[this.value.name] },
      back() {
        let ret = this.source.editor.transition
        ? this.source.editor.transition.filter(item => item.from === this._value && item.vector === -1)
        : this.source.getShell.transition.filter(item => item.from === this._value && item.vector === -1);
        return ret;
      },
      forward() { return this.source.editor.transition
        ? this.source.editor.transition.filter(item => item.from === this._value && item.vector === 1)
        : this.source.getShell.transition.filter(item => item.from === this._value && item.vector === 1) },
      additional() { return this.source.editor.transition
        ? this.source.editor.transition.filter(item => item.from === this._value && item.vector === 0)
        : this.source.getShell.transition.filter(item => item.from === this._value && item.vector === 0) },
    },
    methods:{
      change(transition){
        const item = _.cloneDeep(this.value.row);
        const id = item.id;
        const Model = this.source.type;
        this.source.runProcedure({ type: 'Transition', params: { id, transition, Model: this.source.editor.type || Model } })
        .then(ans => {
          _.forEach(ans.data, (arr, type) => {
            if (type === 'Invoice') {
              _.forEach(arr, item => {
                if (item.id === this.source.user.cards.invoice && item.status_id !== 'formed') {
                  this.source.cardDelete(item.id, 'Invoice');
                }
              })
            } else if (type === 'Order') {
              _.forEach(arr, item => {
                if (this.source.user.cards.orders.includes(item.id) && item.status_id !== 'formed') {
                  this.source.cardDelete(item.id, 'Order');
                }
              })
            }
          });
        })
      }
    },
    created(){
      this.buttons.enter.enable = false;
    },
  }
</script>

<style scoped lang="less">
  .t-editor{
    display: flex;
    flex-flow: row;
    flex-wrap: nowrap;
  }
</style>