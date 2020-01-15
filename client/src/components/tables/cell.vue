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
    <component
      v-if="cell.component"
      v-bind:is="cell.component"
      v-model="row"
      :optics="optics"
      :source="source"
      :class="cell.class ? cell.class : ''"
    />
    <router-link
      v-else-if="cell.to"
      :to="cell.to(row)"
      :class="`t-value ${cell.class ? cell.class : ''}`"
      v-html="cell.html ? cell.html(row) : row[name]"
    />
    <div
      v-else
      :class="`t-value ${cell.class ? cell.class : ''}`"
      v-html="cell.html ? cell.html(row) : row[name]"
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
      source: null,
    },
    computed:{
      calculatedStyle(){
        const width = this.width
          ? this.width > (this.bodyWidth - 100)/2
            ? `${(this.bodyWidth - 100)/2}px`
            : `${this.width}px`
          : 'auto';
        return this.width === null ? '' : `flex: 1 1 auto; width: ${width}; order: ${ this.cell.order }`;
      },
    },
  }
</script>

<style scoped lang="less">
  .t-cell{
    a{
      border: none;
      text-decoration: underline;
      color: navy;
    }
    .t-label{
      font-size: 10px;
      white-space: nowrap;
      display: block;
    }
    .t-value{
      &::v-deep svg{height: 20px}
      text-align: left;
    }
  }
</style>