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
  <article
    v-else
    :class="{ 't-hide': gtCalculated === null }"
  >
    <row
      v-for="(row, ind) in table"
      v-model="value"
      :row="row"
      :ind="ind"
      :key="ind"
      :gtCalculated="gtCalculated"
      :isLinear="isLinear"
      :tableRow="tableRow"
      :one="one"
      :parentType="parentType"
    />
  </article>
</template>

<script>
  import Row from "./row";
  export default {
    name: "Body",
    components: {Row},
    props: {
      value: null,
      gtCalculated: null,
      isLinear: true,
      tableRow: null,
      one: null,
      parentType: null,
    },
    computed:{
      loading(){ return this.value.dataSource.getTable.loadProcessor.eid },
      table(){
        const table = this.value.dataSource.getTable;
        return table.loadProcessor.displayedSelection(table.optics.value);
      },
      //invoice(){return this.value.dataSource.getInvoice;},
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

  article{
    overflow: auto;
    height: 100%;
  }

  .t-hide{ height: 0 !important }

  article.t-linear{
    padding-top: 2px;
  }

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