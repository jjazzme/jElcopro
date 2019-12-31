<template>
  <aside
    v-if="loading"
  >
    <svg focusable="false" viewBox="0 0 512 512"><path fill="currentColor" d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg>
    <div>
      <b-button
        variant="link"
        @click="cancel"
      >
        Прервать
      </b-button>
    </div>
  </aside>
  <article v-else>
    {{ table }}
  </article>
</template>

<script>
  export default {
    name: "tableBody",
    props: {
      value: null,
    },
    computed:{
      loading(){ return this.value.dataSource.getTable.loadProcessor.eid },
      table(){
        const table = this.value.dataSource.getTable;
        return table.loadProcessor.displayedSelection(table.optics.value);
      }
    },
    methods:{
      cancel(){
        const eid = this.value.dataSource.getTable.loadProcessor.eid;
        let request = this.$store.getters['Binder/getRequestByEid'](eid);
        request.source.cancel('aborted');
        this.value.dataSource.getTable.loadProcessor.eid = null;
        this.$store.commit('Binder/removeRequest', request.uid);
      }
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  aside {
    flex: 1 1 auto;
    text-align: center;
    overflow: auto;
    padding-top: 20px;
    >svg {
      color: @spinner;
      height: 200px;
      max-height: 50vh;
      animation-name: spin;
      animation-duration: 4000ms;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
    }
    >div {
      margin-top: 20px;
      z-index: 200;
    }
  }
</style>