<template>
  <div
    class="t-select"
    v-if="visible"
  >
    <option-component
      v-for=" (val, ind) in data._db"
      :class="{'t-selected': selected['db'][ind]}"
      :row="val"
      :last="data._db.length === ind+1"
      :ind="ind"
      type="db"
      :key="`db_${ind}`"
      :cursor="cursor"
    />
    <hr />
    <option-component
      v-for=" (val, ind) in data._dadata"
      :class="{'t-selected': selected['dadata'][ind]}"
      :row="val"
      :last="data._dadata.length === ind+1"
      :ind="ind"
      type="dadata"
      :key="`dd_${ind}`"
      :cursor="cursor"
    />
  </div>
</template>

<script>
  import OptionComponent from "./option";
  export default {
    name: "selectCompany",
    components: {OptionComponent},
    props:{
      data: null,
      cursor: null,
    },
    data(){
      return {
      }
    },
    computed:{
      selected(){
        const ret = { db: {}, dadata: {} };
        if (this.cursor && this.cursor.type && this.cursor.position !== null) {
          ret[this.cursor.type][this.cursor.position] = true;
        }
        return ret;
      },
      visible(){
        return this.data?._dadata?.length > 0 || this.data?.db?.length > 0
      },
    },
    methods:{
      notInDB(item){
        return !this.data._db.find(el => el.party.inn == item.data.inn && el.party.ogrn == item.data.ogrn)
      }
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  hr{
    color: black;
    background-color: black;
  }
  .t-selected{
    background-color: @table-header-bg;
    color: @table-header-text;
  }

</style>