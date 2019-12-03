<template>
  <article>
    <page-environment
      v-if="value"
      :head="{title: {main: 'таблицы', method: value.Name.many}}"
    />
    <paginator
      v-model="value"
    />
    <table-header
      v-model="value"
    />
    <table-body
      v-model="value"
    />
  </article>
</template>

<script>
  import Paginator from "../../components/tables/v3/paginators/tablePaginator";
  import TableHeader from "../../components/tables/v3/tablesHeader/tableHeader";
  import TableBody from "../../components/tables/v3/tablesBody/tableBody";
  import TableSource from "../../classLib/TableSource";
  export default {
    name: "Tables",
    components: {TableBody, TableHeader, Paginator},
    data(){
      return {
        value: null,
        previousOptics: null,
        previousSaveShellPayload: null,
      }
    },
    computed:{
      dataLoader(){
        return _.debounce(
          () => {
            if (!_.isEqual(this.value.optics.value, this.previousOptics)) {
              this.previousOptics = _.cloneDeep(this.value.optics.value);
              this.value.loadData();
            }
          }, this.value.dataDebounce
        )
      }
    },
    methods:{
      initialPage(route){
        const optics = JSON.parse(route.query.optics ?? "{}");
        const type = route.params.type;
        this.$set(this, 'value', new TableSource(type, optics))
      }
    },
    created() {
      this.initialPage(this.$route);
    },

    beforeRouteUpdate(to, from, next){
      if (to.params.type !== from.params.type) this.initialPage(to);
      next();
    },
    watch:{
      'value.queryOptics' ( n, o ) {
        if(n) {
          if ( !this.$route.query.optics || !_.isEqual(JSON.parse(this.$route.query.optics), n)) {
            this.$router.push({ query: { optics: JSON.stringify(n) } });
            this.dataLoader();
          } else if (!o) this.dataLoader();
        }
      },
      'value.saveShellPayload': {
        handler: //function(n){console.log(n)},
          _.debounce(function(n){
            if ( !this.previousSaveShellPayload) {
              this.value.saveShell(n);
              this.previousSaveShellPayload = n;
            } else {
              const nWoId = _.cloneDeep(n);
              delete nWoId.id;
              const oWoId = _.cloneDeep(this.previousSaveShellPayload);
              delete oWoId.id;
              if ( !_.isEqual( nWoId, oWoId ) ) {
                this.value.saveShell(n);
                this.previousSaveShellPayload = n;
              }
            }
          }, 1000),
        deep: true
      },
    }
  }
</script>

<style scoped>

</style>