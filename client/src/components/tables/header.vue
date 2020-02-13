<template>
  <div
    :class="{ header: true, 't-hide': !isLinear }"
    :style="`width: ${width}`"
  >
    <div
      :class="{ 't-row': true }"
      :style="gtCalculated"
    >
      <div
        class="t-fr-cell t-cell"
        v-if="firstShow"
        data-field="_firstCell"
      >
        <div class="t-content">
          <b-dropdown
            size="sm"
            variant="outline-light"
          >
            <b-dropdown-item-button
              @click="add"
            >
              {{ nameOne }}: добавить
            </b-dropdown-item-button>
          </b-dropdown>
        </div>
      </div>

      <div
        v-for="(cell, name) in value.dataSource.getShell.initial"
        v-if="!cell.hidden && (cell.show === undefined || cell.show === true || ( cell.show && cell.show.list === true ))"
        :key="name"
        :style="`order: ${ cell.order }`"
        class="t-cell"
        :data-field="name"
      >
        <div class="t-label">

        </div>
        <div
          class="t-content"
          v-html="cell.label"
        />
      </div>
    </div>
  </div>
</template>

<script>
  //width: ${value.viewport.tableRow[name].width}px;
  //import _ from 'lodash';

  export default {
    name: "Header",
    props: {
      value: null,
      gtCalculated: null,
      isLinear: null,
      width: null,
    },
    computed:{
      nameOne(){
        const one = this.value.dataSource.getShell.name.one;
        return one.charAt(0).toUpperCase() + one.slice(1);
      },
      loading(){ return this.value.dataSource.getTable.loadProcessor.eid },
      enabled(){ return this.value.viewport.tableRowIsLinear && !_.isEmpty(this.value.viewport.tableRow) },
      firstShow(){ return !this.value.dataSource.getShell.noFirstRowCell }
    },
    methods: {
      add(){
        this.$router.push({ name: 'item', params: { type: this.value.dataSource.type, id: 0 } })
        /*
        const item = _.cloneDeep(this.value.dataSource.getShell.newItem);
        const type = this.value.dataSource.type;
        this.value.dataSource.updateItem({ type, item })
          .then(ans => {
            console.log(ans);
          })

         */
      }
    },
    created(){
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .t-hide{
    overflow-y: hidden;
    overflow-x: auto;
    max-height: 0;
  }
  .header{
    .t-row{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
      min-height: 40px;
      >*{
        background: @table-header-bg;
        color: @table-header-text;
        //padding: 5px;
      }
      .t-cell{
        white-space: nowrap;
        display: inline-block;
        .t-content{
          display: inline-block;
          a{
            border: none;
            text-decoration: underline;
            color: navy;
          }
          .t-label{
            font-size: 10px;
            white-space: nowrap;
          }
          .t-value{
            &::v-deep svg{height: 20px}
            text-align: left;
          }
        }
      }
    }
  }
</style>