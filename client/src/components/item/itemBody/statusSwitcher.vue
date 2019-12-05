<template>
  <div>
    <b-button
      variant="link"
      @click="makeTransition(transition, 'back')"
      :disabled="!transition.back"
    >
      <fa-icon icon="step-backward" />
    </b-button>
    <span class="p-l-alias">{{status.alias}}</span>
    <b-button
      variant="link"
      @click="makeTransition(transition, 'forward')"
      :disabled="!transition.forward"
    >
      <fa-icon icon="step-forward" />
    </b-button>

    <div
      class="p-l-own"
      v-if="isOwnShow"
    >
      <div>Только свои</div>
      <b-checkbox
        v-model="own"
      />
    </div>

    <div
      class="p-l-makeTran"
      v-if="isMakeTransfer"
    >
      <b-button
        variant="link"
        @click="makeTransfer()"
      >
        Создать {{env.shell.type === 'Invoice' ? 'исходящий УПД' : 'входящий УПД'}} из {{env.selectedItems.length === 0 ? 'всех строк' : 'выбранных строк' }}
      </b-button>
    </div>

  </div>
</template>

<script>
  import Error from "../../../classLib/Error";

  export default {
    name: "statusSwitcher",
    props: {
      value: null,
      env: null,
      ind: null,
    },
    data(){
      return{
        own: false,
      }
    },
    computed:{
      isMakeTransfer(){
        return this.status.value === 'in_work';
      },
      isOwnShow(){ return this.env.shell.type === 'Invoice' && this.status.value === 'formed' },
      status(){
        const value = this.env.document[this.ind];
        return {value: value, alias: this.env.statusSwitcher.statuses[value]}
      },
      transition(){
        const type = this.env.shell.type;
        const transition = this.env.statusSwitcher[type];
        const from = this.env.document[this.ind];
        return {
          back: _.find(transition, item => item.from === from && item.vector === -1),
          forward: _.find(transition, item => item.from === from && item.vector === 1)
        }
      }
    },
    methods:{
      makeTransfer(){
        const optics = { parent_id: this.env.document.id, lines: this.env.selectedItems, type: this.env.shell.type === 'Invoice' ? 'out' : 'in' };
        this.$store.dispatch('LOADER/makeTransfer', optics)
          .then(ans => {
            console.log(ans);
          })
          .catch(err => new Error(err));
      },
      makeTransition(transition, vector){
        this.$store.dispatch('LOADER/makeTransition', {id: this.env.document.id, transition: transition[vector].name, type: this.env.shell.type, own: this.own})
          .then(ans => {
            if (ans) this.$set(this.env.document, this.ind, transition[vector]?.to);
          })
          .catch(err => new Error(err));
      },
    },
  }
</script>

<style scoped lang="less">
  .p-l-alias{display: inline-block; width: 150px; text-align: center;}
  .p-l-own{
    display: flex;
    align-items: center;
    //div:first-child{display: inline-block; margin-top: -10px;}
    div:last-child{height: 20px; margin-left: 10px}
  }
</style>