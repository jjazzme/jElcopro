<template>
  <div class="p-l-lines">
    <div
      class="p-l-line"
      v-for="(line, ind) in value.document.documentLines"
    >
      <item-lines-line
        v-model="value.document.documentLines[ind]"
        :env="value"
        :ind="ind"
      />
    </div>
  </div>
</template>

<script>
  import ItemLinesLine from "./itemLines/itemLinesLine";
  export default {
    name: "itemLines",
    components: {ItemLinesLine},
    props: {
      value: null,
    },
  }
</script>

<style scoped>

</style>