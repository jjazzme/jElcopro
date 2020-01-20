<template>
  <div>
    <component
      v-bind:is="value.dataSource.getShell.opticsConstructor"
      v-model="value"
      :gtCalculated="gtCalculated"
    />
    <Body
      v-model="value"
      ref="table"
      class="t-table"
      :gtCalculated="gtCalculated"
      :isLinear="isLinear"
    />
  </div>
</template>

<script>
  import Body from "./body";
  export default {
    name: "Table",
    components: {Body},
    props:{
      value: null,
    },
    data(){
      return {
        calculateAmount: 25,
        tableRow: null,
        isLinear: true,
        width: 0,
      }
    },
    computed:{
      gtCalculated(){
        if (_.isEmpty(this.tableRow)){
          return null;
        } else {
          let ret = 'grid-template-columns: ';
          const flat = this.tableRow.map(item => item.width);
          const max = Math.max.apply(null, flat);
          _.forEach(flat, width => {
            ret += width === max && ret.indexOf('auto') < 0 ? 'auto ' : `${width}px `
          });
          return ret;
        }
      },
      optics(){
        return this.value.dataSource.getTable ? JSON.stringify(this.value.dataSource.getTable.optics.value) : null;
      },
      getSource() {
        return _.debounce(
          () => {
            const optics = this.value.dataSource.getBackSensitiveOptics;
            if (!optics) return;

            this.value.dataSource.getTable.loadProcessor.getSource(optics, this.value.dataSource.getShell.controller)
              .finally(()=>{
                this.calculateTable()
              })
          }, this.value.dataSource.debounceAmount
        );
      },
      type(){
        return this.value.dataSource.type;
      },
    },
    methods:{
      calculateTable(){
        let waitTable = () => {
          _.delay(()=>{
            if (!this.$refs.table) {
              waitTable();
              return;
            }
            const table = this.$refs.table.$el;
            if (table.tagName !== 'ARTICLE') {
              waitTable();
              return;
            }
            const tableRow = [];
            _.forEach(table.querySelectorAll('div.t-row'), row => {
              _.forEach(row.querySelectorAll(':scope > *'), (cell, ind) => {
                const top =  cell.getBoundingClientRect().top - cell.parentElement.getBoundingClientRect().top;
                const width = cell.querySelector(':scope > .t-content').scrollWidth + 1;
                if (tableRow[ind]) {
                  if (tableRow[ind].width < width) tableRow[ind].width = width;
                  if (tableRow[ind].top < top) tableRow[ind].top = top;
                } else tableRow.push({ width, top });
              })
            });

            this.$set(this, 'tableRow',  tableRow);
            this.calculateAmount = this.calculateAmount * 2;

            this.$set(this, 'isLinear', this.$refs.table.$el.scrollWidth === this.$refs.table.$el.clientWidth);
            this.$set(this, 'width', this.$refs.table.$el.clientWidth);

            if (this.calculateAmount < 200) waitTable();
            else this.calculateAmount = 25;
            /*
                          this.$set(this.value.viewport, 'tableRow', tableRow);
            this.calculateAmount = this.calculateAmount * 2;
            if ($(this.$refs.table.$el).hasClass('t-opacity') && this.calculateAmount > 200) $(this.$refs.table.$el).removeClass('t-opacity');
            const tops = _.map(tableRow, cell => cell.top);
            this.$set(this.value.viewport, 'tableRowIsLinear', Math.min.apply(Math, tops) === Math.max.apply(Math, tops));

            if (this.calculateAmount < 500) waitTable();
            else this.calculateAmount = 25;
            */
          }, this.calculateAmount)
        };

        waitTable();
      },
      onResize: _.debounce( function(){
        //this.calculateTable()
      }, 500),
    },
    created(){
      window.addEventListener("resize", this.onResize);
      this.calculateTable();
      this.value.viewport.tableRow = {};
      const queryOptics = this.value.dataSource.getOpticsObject(this.$route.query.optics);
      if (queryOptics) this.$set(this.value.dataSource.getTable.optics, 'value', queryOptics);
      this.getSource();
    },
    destroyed(){
      window.removeEventListener("resize", this.onResize);
    },
    watch:{
      optics(n){
        if(n !== this.$route.query.optics) this.$router.replace({ query: { optics: n } });
        this.getSource();
      },
      type(n){
        this.calculateTable();
        this.value.dataSource.type = n;
        let queryOptics = this.value.dataSource.getOpticsObject(this.$route.query.optics);
        if (queryOptics) this.$set(this.value.dataSource.getTable.optics, 'value', queryOptics);
        else {
          queryOptics =JSON.stringify(this.value.dataSource.getTable.optics.value);
          if(queryOptics !== this.$route.query.optics) this.$router.replace({ query: { optics: queryOptics } });
        }
        this.getSource();
      },
    },
  }
</script>

<style scoped>

</style>