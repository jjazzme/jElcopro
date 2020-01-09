<template>
  <header
    v-if="value.viewport.tableRowIsLinear"
  >
    <div class="t-row">
      <div>first</div>

      <div
        v-for="(cell, name) in value.dataSource.getShell.initial"
        v-if="cell.label"
        :key="name"
        v-html="cell.label"
        :style="`width: ${value.viewport.tableRow[name].width}px`"
      />
    </div>
  </header>
</template>

<script>
  export default {
    name: "tableParametersConstructor",
    props: {
      value: null,
    },
  }
</script>

<style scoped lang="less">
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

</style>