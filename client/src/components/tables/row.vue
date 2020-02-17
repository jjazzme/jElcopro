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
      :width="tableRow ? tableRow.find(item => item.name === '_firstCell').width : 'auto'"
      :one="one"
      :parentType="parentType"
    />

    <cell
      v-for="(cell, name) in value.dataSource.getShell.initial"
      v-if="!cell.hidden && (cell.show === undefined || cell.show === true || ( cell.show && cell.show.list === true ))"
      :key="name"
      :name="name"
      :cell="cell"
      :row="row"
      :optics="value.dataSource.getTable.optics.value"
      :bodyWidth="value.viewport.width"
      :bodyHeight="value.viewport.height"
      :source="value.dataSource"
      :width="tableRow ? tableRow.find(item => item.name === name).width : 'auto'"
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
      tableRow: null,
      one: null,
      parentType: null,
    },
    computed:{

    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";


</style>