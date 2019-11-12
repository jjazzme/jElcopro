<template>
  <div class="p-l-val-20">
    <b-button
      class="p-l-add"
    >
      + {{value}}
    </b-button>
  </div>
</template>

<script>
  export default {
    name: "addButton",
    props: {
      value: null,
    }
  }
</script>

<style scoped lang="less">
  .p-l-val-20{
    margin-top: 20px;
  }
  .p-l-add{
    margin: auto;
    width: 90%;
  }
</style>