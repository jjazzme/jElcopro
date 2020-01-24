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
      back() { return this.source.getShell.transition.filter(item => item.from === this._value && item.vector === -1) },
      forward() { return this.source.getShell.transition.filter(item => item.from === this._value && item.vector === 1) },
      additional() { return this.source.getShell.transition.filter(item => item.from === this._value && item.vector === 0) },
    },
    methods:{
      change(transition){
        const item = _.cloneDeep(this.value.row);
        const id = item.id;
        const Model = this.source.type;
        this.source.updateItem({ type: 'Transition', item: { id, transition, Model }, returnType: Model })
      }
    },
    created(){
      /*
      this._value = this.value.row[this.value.name];
      this.back = this.source.getShell.transition.filter(item => item.from === this._value && item.vector === -1);
      this.forward = this.source.getShell.transition.filter(item => item.from === this._value && item.vector === 1);
      this.additional = this.source.getShell.transition.filter(item => item.from === this._value && item.vector === 0);
       */
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