<template>
  <main>
    <component
      v-bind:is="model.dataSource.getShell.opticsConstructor"
      v-model="model"
    />
    <table-body
      v-model="model"
    />
    <page-environment
      :head = "{ title: { main: 'таблицы', method: model.dataSource.getShell.name.many } }"
      :foot = "{ component: model.dataSource.getShell.footer, vmodel: model.dataSource.getTable }"
    />
  </main>

</template>

<script>
  import Footer from "../classLib/Footer";
  import tableBody from "../components/tables/tableBody";

  export default {
    name: "Tables",
    components: {tableBody},
    props:{
      model: null
    },
    data(){
      return {
        value: null,
        //previousOptics: null,
        //previousSaveShellPayload: null,
      }
    },
    computed:{
      footer(){
        return new Footer({ component: this.model.dataSource.getShell.footer });
      },
      optics(){
        return this.model.dataSource.getTable ? JSON.stringify(this.model.dataSource.getTable.optics.value) : null;
      },
      type(){
        return this.$route.params.type;
      },
      getSource() {
        return _.debounce(
          () => {
            const optics = this.model.dataSource.getBackSensitiveOptics;
            if (!optics) return;

            this.model.dataSource.getTable.loadProcessor.getSource(optics, this.$store);

          }, this.model.dataSource.debounceAmount
        );
      },
    },
    methods:{

    },
    created() {
      this.model.dataSource.type = this.type;
      const queryOptics = this.model.dataSource.getOpticsObject(this.$route.query.optics);
      if (queryOptics) this.$set(this.model.dataSource.getTable.optics, 'value', queryOptics);
      this.getSource();
    },

    watch:{
      optics(n){
        if(n !== this.$route.query.optics) this.$router.replace({ query: { optics: n } });
        this.getSource();
      },
      type(n){
        this.model.dataSource.type = n;
        let queryOptics = this.model.dataSource.getOpticsObject(this.$route.query.optics);
        if (queryOptics) this.$set(this.model.dataSource.getTable.optics, 'value', queryOptics);
        else {
          queryOptics =JSON.stringify(this.model.dataSource.getTable.optics.value);
          if(queryOptics !== this.$route.query.optics) this.$router.replace({ query: { optics: queryOptics } });
        }
        this.getSource();
      },
      /*
      'value.queryOptics' ( n, o ) {
        if(n) {
          if ( !this.$route.query.optics && !_.isEqual(JSON.parse(this.$route.query.optics), n)) {
            this.$router.replace({ query: { optics: JSON.stringify(n) } });
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
       */
    }
  }
</script>

<style scoped>

</style>