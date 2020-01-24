<template>
  <main>
    <Table
      v-model="value"
    />
    <page-environment
      :head = "{ title: { main: 'таблицы', method: value.dataSource.getShell.name.many } }"
      :foot = "{ component: value.dataSource.getShell.footer, vmodel: value.dataSource.getTable }"
    />
  </main>

</template>

<script>
  import Body from "../components/tables/body";
  import Table from "../components/tables/table";

  export default {
    name: "Tables",
    components: {Table, Body},
    props:{
      value: null,
    },
    computed:{
      type(){
        return this.$route.params.type;
      },
    },
    methods:{

    },
    created() {
      this.value.dataSource.type = this.type;
    },
    watch:{
      type(n){
        this.value.dataSource.type = n;
      }
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";


</style>