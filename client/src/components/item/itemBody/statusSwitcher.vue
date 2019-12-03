<template>
  <div>
    <b-button
      variant="link"
      @click="back(to.back)"
      :disabled="!to.back"
    >
      <fa-icon icon="step-backward" />
    </b-button>
    {{status.alias}}
    <b-button
      variant="link"
      @click="forward(to.forward)"
      :disabled="!to.forward"
    >
      <fa-icon icon="step-forward" />
    </b-button>
  </div>
</template>

<script>
  export default {
    name: "statusSwitcher",
    props: {
      value: null,
      env: null,
      ind: null,
    },
    computed:{
      status(){
        const value = this.env.document[this.ind];
        return {value: value, alias: this.env.statusSwitcher.statuses[value]}
      },
      to(){
        const type = this.env.shell.type;
        const transition = this.env.statusSwitcher[type];
        const from = this.env.document[this.ind];
        const back = _.find(transition, item => item.from === from && item.vector === -1)?.to;
        const forward = _.find(transition, item => item.from === from && item.vector === 1)?.to;
        return {back:back, forward:forward}
      }
    },
    methods:{
      back(to){
        this.$set(this.env.document, this.ind, to);
      },
      forward(to){
        this.$set(this.env.document, this.ind, to);
      },
    },
  }
</script>

<style scoped>

</style>