<template>
  <main v-if="item">
    <!--h1>{{ h1(item) }}</h1>
    <h2>{{ h2 }}</h2-->

    <Table
      v-model="value"
      :one="parseInt(this.$route.params.id)"
    />

    <page-environment
      :head = "{ title: { main: h1(item), method: h2 } }"
      :foot = "null"
    />
  </main>
</template>

<script>
  import Table from "../components/tables/table";
  export default {
    name: "ManyToOne",
    components: {Table},
    props:{
      value: null,
    },
    data() {
      return {
        item: null,
        row: null,
        field: this.$route.params.field,
        h1: null,
        h2: null,
        parentType: this.$route.params.parentType,
      }
    },
    created(){
      const parentShell = this.value.dataSource.shells.template[this.parentType];
      this.$set(this, 'row', parentShell.initial);
      this.$set(this, 'h1', parentShell.h1);
      this.$set(this, 'h2', this.row[this.field].label);
      //this.$set(this, 'childRow', this.value.dataSource.shells.template[shell.initial.documentLines.shell].initial);
      this.$set(this.value.dataSource, 'type', this.row[this.field].shell);
      this.value.dataSource.getSourceById({ type: this.parentType, id: parseInt(this.$route.params.id), check: 'documentLines' })
        .then(item => {
          this.$set(this, 'item', item);
        });
    }
  }
</script>

<style scoped lang="less">

  @import "~@/less/_variables";
  main{
    h1 {
      flex: 1 1 auto;
      h2{
        flex: 1 1 auto;
        text-align: center;
      }
    }
  }
</style>