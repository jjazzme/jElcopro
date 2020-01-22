<template>
  <div
    class="t-table"
    ref="table"
  >
    <component
      v-bind:is="value.dataSource.getShell.opticsConstructor"
      v-model="value"
      :gtCalculated="gtCalculated"
      :isLinear="isLinear"
    />
    <Body
      v-model="value"
      ref="body"
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
        getSourceAmount: 25,
      }
    },
    computed:{
      gtCalculated(){
        if (_.isEmpty(this.tableRow)){
          return null;
        } else {
          let ret = 'grid-template-columns: ';
          //const flat = this.tableRow.map(item => item.width);
          //const max = Math.max.apply(null, flat);
          _.forEach(this.tableRow, cell => {
            if(cell.name === '_firstCell') {
              ret += `${cell.width}px `;
            } else {
              ret += `minmax(${cell.width}px, auto) `;
            }

            //ret += width === max && ret.indexOf('auto') < 0 ? 'auto ' : `${width}px `
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

        //

        let waitTable = () => {
          _.delay(()=>{
            if (!this.$refs.body) {
              waitTable();
              return;
            }
            const body = this.$refs.body.$el;
            const table = this.$refs.table;
            if (body.tagName !== 'ARTICLE') {
              waitTable();
              return;
            }
            const tableRow = [];
            _.forEach(table.querySelectorAll('div.t-row'), row => {
              _.forEach(row.querySelectorAll(':scope > *'), (cell, ind) => {
                const top =  cell.getBoundingClientRect().top - cell.parentElement.getBoundingClientRect().top;
                const contentCell = cell.querySelector(':scope > .t-content');
                let width = contentCell.getBoundingClientRect().width + 4;
                const name = $(cell).attr('data-field');
                if ( width < 50) width = 50;
                if (tableRow[ind]) {
                  if (tableRow[ind].width < width) tableRow[ind].width = width;
                  if (tableRow[ind].top < top) tableRow[ind].top = top;
                } else tableRow.push({ width, top, name });
              })
            });

            this.$set(this, 'tableRow',  tableRow);

            this.$set(this, 'isLinear', this.$refs.body.$el.scrollWidth === this.$refs.body.$el.clientWidth);
            this.$set(this, 'width', this.$refs.body.$el.clientWidth);

            //this.calculateAmount = this.calculateAmount * 2;
            //if (this.calculateAmount < 200) waitTable();
            //else this.calculateAmount = 25;
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
      //this.calculateTable();
      //this.value.viewport.tableRow = {};
      const queryOptics = this.value.dataSource.getOpticsObject(this.$route.query.optics);
      if (queryOptics) this.$set(this.value.dataSource.getTable.optics, 'value', queryOptics);

      this.$set(this, 'isLinear', true);
      this.$set(this, 'tableRow', null);
      this.getSource();
    },
    destroyed(){
      window.removeEventListener("resize", this.onResize);
    },
    watch:{
      optics(n){
        //this.calculateTable();
        if(n !== this.$route.query.optics) this.$router.replace({ query: { optics: n } });

        this.$set(this, 'isLinear', true);
        this.$set(this, 'tableRow', null);
        this.getSource();
      },
      type(n){
        //this.calculateTable();
        this.value.dataSource.type = n;
        let queryOptics = this.value.dataSource.getOpticsObject(this.$route.query.optics);
        if (queryOptics) this.$set(this.value.dataSource.getTable.optics, 'value', queryOptics);
        else {
          queryOptics =JSON.stringify(this.value.dataSource.getTable.optics.value);
          if(queryOptics !== this.$route.query.optics) this.$router.replace({ query: { optics: queryOptics } });
        }

        this.$set(this, 'isLinear', true);
        this.$set(this, 'tableRow', null);
        this.getSource();
      },
    },
  }
</script>

<style scoped lang="less">
  .t-table{
    display: flex;
    flex-flow: column;
    height: 100%;
    width: 100%;
    position: absolute;

  }
</style>