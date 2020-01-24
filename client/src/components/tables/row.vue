<template>
  <div
    :class="{'t-row': true, 't-linear': isLinear}"
    :style="gtCalculated"
  >
    <first-row-cell
      v-if="!value.dataSource.getShell.noFirstRowCell"
      v-model="value"
      :ind="ind"
      :row="row"
    />

    <cell
      v-for="(cell, name) in value.dataSource.getShell.initial"
      v-if="!cell.hidden && (cell.show === undefined || cell.show === true || ( cell.show && cell.show.list === true ))"
      :key="name"
      :name="name"
      :cell="cell"
      :row="row"
      :optics="value.dataSource.getTable.optics.value"
      :width="value.viewport.tableRow[name] ? value.viewport.tableRow[name].width : null"
      :bodyWidth="value.viewport.width"
      :bodyHeight="value.viewport.height"
      :source="value.dataSource"
    />

  </div>
</template>

<script>
  //grid-template-columns: 70px auto 100px 100px 100px 100px
  import FirstRowCell from "./firstRowCell";
  import Cell from "./cell";

  export default {
    name: "Row",
    components: {Cell, FirstRowCell},
    props: {
      row: null,
      ind: null,
      value: null,
      gtCalculated: null,
      isLinear: true,
    },
    computed:{

    },
  }
</script>

<!--style scoped lang="less">
  @import "~@/less/_variables";

  .t-linear{
    &::v-deep .t-cell .t-label {display: none}
  }

  .t-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: wrap;
    height: auto;
    border-bottom: silver 1px dotted;
  }
  .t-row:hover{background-color: #e0e0e0}
  .t-cell{
    padding: 2px 5px;
    margin: 3px;
    //flex: 1 1 auto;
    align-self: stretch;
    //border: silver 1px solid;
    background-color: #f6f6f6;
  }
  @media @wid {
    .t-row {
      flex-wrap: nowrap;
    }
  }
</style-->

<style scoped lang="less">
  @import "~@/less/_variables";


</style>