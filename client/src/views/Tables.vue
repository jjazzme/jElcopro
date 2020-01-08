<template>
  <main>
    <component
      v-bind:is="value.dataSource.getShell.opticsConstructor"
      v-model="value"
    />
    <Body
      v-model="value"
    />
    <page-environment
      :head = "{ title: { main: 'таблицы', method: value.dataSource.getShell.name.many } }"
      :foot = "{ component: value.dataSource.getShell.footer, vmodel: value.dataSource.getTable }"
    />
  </main>

</template>

<script>
  import Footer from "../classLib/Footer";
  import Body from "../components/tables/body";

  export default {
    name: "Tables",
    components: {Body},
    props:{
      value: null
    },
    data(){
      return {
      }
    },
    computed:{
      footer(){
        return new Footer({ component: this.value.dataSource.getShell.footer });
      },
      optics(){
        return this.value.dataSource.getTable ? JSON.stringify(this.value.dataSource.getTable.optics.value) : null;
      },
      type(){
        return this.$route.params.type;
      },
      getSource() {
        return _.debounce(
          () => {
            const optics = this.value.dataSource.getBackSensitiveOptics;
            if (!optics) return;

            this.value.dataSource.getTable.loadProcessor.getSource(optics, this.$store);

          }, this.value.dataSource.debounceAmount
        );
      },
    },
    methods:{

    },
    created() {
      this.value.dataSource.type = this.type;
      const queryOptics = this.value.dataSource.getOpticsObject(this.$route.query.optics);
      if (queryOptics) this.$set(this.value.dataSource.getTable.optics, 'value', queryOptics);
      this.getSource();
    },

    watch:{
      optics(n){
        if(n !== this.$route.query.optics) this.$router.replace({ query: { optics: n } });
        this.getSource();
      },
      type(n){
        this.value.dataSource.type = n;
        let queryOptics = this.value.dataSource.getOpticsObject(this.$route.query.optics);
        if (queryOptics) this.$set(this.value.dataSource.getTable.optics, 'value', queryOptics);
        else {
          queryOptics =JSON.stringify(this.value.dataSource.getTable.optics.value);
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