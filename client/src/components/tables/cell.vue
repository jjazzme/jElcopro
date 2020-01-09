<template>
  <div
    class="t-cell"
    :style="calculatedStyle"
    :data-field="name"
  >
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
      width: null,
      bodyWidth: null,
    },
    computed:{
      calculatedStyle(){
        const width = this.width
          ? this.width > (this.bodyWidth - 100)/2
            ? `${(this.bodyWidth - 100)/2}px`
            : `${this.width}px`
          : 'auto';
        return this.width === null ? '' : `flex: 1 1 auto; width: ${width}`;
      },
    },
  }
</script>

<style scoped lang="less">
  .t-cell{
    .t-label{
      font-size: 10px;
      white-space: nowrap;
    }
    .t-value{
      &::v-deep svg{height: 20px}
      text-align: center;
    }
  }
</style>