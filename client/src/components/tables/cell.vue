<template>
  <div class="t-cell">
    <div
      v-html="cell.label"
      class="t-label"
    />
    <div
      class="t-value"
      v-if="cell.html"
      v-html="cell.html(row)"
    />
    <component
      v-else-if="cell.component"
      v-bind:is="cell.component"
      v-model="row"
      :optics="optics"
    />
    <div
      v-else
      v-html="row[name]"
    />
  </div>
</template>

<script>
  export default {
    name: "cell",
    props:{
      cell: null,
      name: null,
      row: null,
      optics: null,
    },
  }
</script>

<style scoped lang="less">
  .t-cell{
    .t-label{
      font-size: 10px;
    }
    .t-value{
      text-align: center;
    }
  }
</style>