<template>
  <div class="p-l-card">
    <div class="p-l-row"
         v-for="(val, ind) in value.shell.initial"
         v-if="val.card !== false"
    >
      <item-body-column
        v-model="value.shell.initial[ind]"
        :env="value"
        :ind="ind"
      />
    </div>
  </div>
</template>

<script>
  import ItemBodyColumn from "./itemBody/itemBodyColumn";
  export default {
    name: "itemBody",
    components: {ItemBodyColumn},
    props: {
      value: null,
    },
  }
</script>

<style scoped lang="less">
  .p-l-card{
    .p-l-row{
      height: 40px;
    }
  }
</style>