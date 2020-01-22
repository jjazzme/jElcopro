<template>
  <div
    class="header"
  >
    <div
      :class="{ 't-row': true, 't-linear': isLinear }"
      :style="gtCalculated"
    >
      <div
        class="t-fr-cell t-cell"
        v-if="firstShow"
        data-field="_firstCell"
      >
        <div class="t-content">
          first
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
    name: "tableParametersConstructor",
    props: {
      value: null,
      gtCalculated: null,
      isLinear: null,
    },
    computed:{
      loading(){ return this.value.dataSource.getTable.loadProcessor.eid },
      enabled(){ return this.value.viewport.tableRowIsLinear && !_.isEmpty(this.value.viewport.tableRow) },
      firstShow(){ return !this.value.dataSource.getShell.noFirstRowCell }
    },
    created(){
    }
  }
</script>

<!--style scoped lang="less">
  @import "~@/less/_variables";

  .t-row{
    display: flex;
    align-items: flex-start;
    flex-flow: row nowrap;
    >div{
      flex: 1 1 auto;
      padding: 2px 5px;
      margin: 3px;
      align-self: stretch;
      background-color: @table-header-bg;
      color: white;
    }
    >div:first-child{
      flex: none;
      width: 70px;
    }
  }

  @media @mob {
    header{
      padding: 5px 10px 0 10px;
    }
  }
  @media @des {
    header{
      padding: 10px 20px 0 20px;
    }
  }
  @media @wid {
    header{
      padding: 20px 40px 0 40px;
    }
  }

</style-->

<style scoped lang="less">
  @import "~@/less/_variables";

  .header{
    .t-row{
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

  /*
  @media @mob {
    .header{
      padding: 0 10px;
    }
  }
  @media @des {
    .header{
      padding: 0 20px;
    }
  }
  @media @wid {
    .header{
      padding: 0 40px;
    }
  }
   */

</style>