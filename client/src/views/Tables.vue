<template>
  <main>
    <Table
      v-model="value"
    />
    <page-environment
      :head = "{ title: { main: 'таблицы', method: value.dataSource.getShell.name.many } }"
      :foot = "{ component: value.dataSource.getShell.footer, vmodel: value.dataSource.getTable }"
    />
  </main>

</template>

<script>
  //      :style="`${value.viewport.tableRowIsLinear ? 'padding-top: 0' : ''}`"
  //import Footer from "../classLib/Footer";
  import Body from "../components/tables/body";
  import Table from "../components/tables/table";

  export default {
    name: "Tables",
    components: {Table, Body},
    props:{
      value: null,
    },
    computed:{
      type(){
        return this.$route.params.type;
      },
      //footer(){
      //  return new Footer({ component: this.value.dataSource.getShell.footer });
      //},
    },
    methods:{
      /*
      onResize: _.debounce( function(){
        _.forEach(this.value.viewport.tableRow, row => row.top = 0)
        const table = this.$refs.table.$el;
        if (table.tagName !== 'ARTICLE') return;
        _.forEach(table.querySelectorAll('div.t-row'), row => {
          _.forEach(row.querySelectorAll('div.t-cell'), (cell, ind) => {
            const name = cell.getAttribute('data-field');
            if (name){
              const top =  cell.getBoundingClientRect().top - cell.parentElement.getBoundingClientRect().top;
              if ( !this.value.viewport.tableRow[name] || this.value.viewport.tableRow[name].top < top) this.$set(this.value.viewport.tableRow[name], 'top', top);
            }
          })
        });
        const tops = _.map(this.value.viewport.tableRow, cell => cell.top);
        this.$set(this.value.viewport, 'tableRowIsLinear', Math.min.apply(Math, tops) === Math.max.apply(Math, tops));
      }, 500),
      calculateTable(){
        let waitTable = () => {
          _.delay(()=>{
            const tableRow = {};
            const table = this.$refs.table.$el;
            if (table.tagName !== 'ARTICLE') waitTable();
            else {
              //if(this.calculateAmount === 25) $(this.$refs.table.$el).addClass('t-opacity');
              _.forEach(table.querySelectorAll('div.t-row'), row => {
                _.forEach(row.querySelectorAll('div.t-cell'), (cell, ind) => {
                  const name = cell.getAttribute('data-field');
                  if (name){
                    const top =  cell.getBoundingClientRect().top - cell.parentElement.getBoundingClientRect().top;
                    const width = cell.scrollWidth;
                    if (tableRow[name]) {
                      if (tableRow[name].width < width) tableRow[name].width = width;
                      if (tableRow[name].top < top) tableRow[name].top = top;
                    } else tableRow[name] = { width, top };
                  }
                })
              });
              this.$set(this.value.viewport, 'tableRow', tableRow);

              this.calculateAmount = this.calculateAmount * 2;
              if ($(this.$refs.table.$el).hasClass('t-opacity') && this.calculateAmount > 200) $(this.$refs.table.$el).removeClass('t-opacity');
              const tops = _.map(tableRow, cell => cell.top);
              this.$set(this.value.viewport, 'tableRowIsLinear', Math.min.apply(Math, tops) === Math.max.apply(Math, tops));

              if (this.calculateAmount < 500) waitTable();
              else this.calculateAmount = 25;
            }
          }, this.calculateAmount)
        };

        waitTable();
      },
      */
    },
    created() {
      this.value.dataSource.type = this.type;
    },
    watch:{
      type(n){
        this.value.dataSource.type = n;
      }
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

<!--style scoped lang="less">
  .t-table{

  }
  .t-opacity{
    &::v-deep article{opacity: 0.5}
    opacity: 0.9;
    &::v-deep .t-row{background-color: #f0f0f0}
    &::v-deep .t-cell{
      opacity: 0;
      white-space: nowrap;
    }
  }
</style-->

<style scoped lang="less">
  @import "~@/less/_variables";


</style>