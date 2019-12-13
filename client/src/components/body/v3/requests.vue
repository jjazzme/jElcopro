<template>
  <div
    v-if="value && value.length>0"
  >
    {{ value.length }}
  </div>
</template>

<script>
  export default {
    name: "requestsComponent",
    props:{
      value: null,
    }
  }
</script>

<style scoped lang="less">
  div{
    position: fixed;
    top: 1px;
    right: 1px;
    padding: 3px;
    background-color: red;
    color: white;
    font-size: 10px;
    opacity: 0.5;
    border-radius: 5px;
  }
</style>