<template>
  <company-editor
    v-if="addForm"
    :dadata="selectedDadata"
    :buttons="buttons"
    :source="source"
  />
  <div
    v-else
  >
    <div class="t-line">
      <div class="t-alias">Название / ИНН / ОГРН</div>
      <b-form-input
        ref="input"
        size="sm"
        type="text"
        v-model="search"
        @keyup.native="keypress"
        @input="input"
      />
    </div>
    <select-company
      :data="data"
      class="t-select"
      :cursor="cursor"
    />
  </div>
</template>

<script>
  import SelectCompany from "./company/selectCompany";
  import CompanyEditor from "./company/companyEditor";
  export default {
    name: "companySelector",
    components: {CompanyEditor, SelectCompany},
    props:{
      value: null,
      source: null,
      buttons: {
        type: Object,
      },
    },
    data(){
      return{
        search: '',
        previous: '',
        data: null,
        cursor: {
          type: 'db',
          position: null,
        },
        //addForm: false,
        selectedDadata: null,
        newCompany: null,
      }
    },
    computed:{
      addForm(){
        return this.buttons.addForm;
      },
    },
    methods:{
      keypress(e){
        const dbLen = this.data?._db?.length || 0;
        const ddLen = this.data?._dadata?.length || 0;
        if (dbLen + ddLen === 0) return;
        let vector = e.key === 'ArrowDown'
          ? 1
          : e.key === 'ArrowUp'
            ? -1
            : 0;

        if( vector === 1){
          this.$set(this.cursor, 'position', this.cursor.position === null ? 0 : this.cursor.position + 1);
          if (this.data[`_${this.cursor.type}`].length < this.cursor.position + 1){
            this.$set(this.cursor, 'type', this.cursor.type === 'db'
              ? this.data._dadata.length > 0
                ? 'dadata'
                : 'db'
              : this.data._db.length > 0
                ? 'db'
                : 'dadata'
            );
            this.$set(this.cursor, 'position', 0);
          }
        }
        else if( vector === -1){
          this.$set(this.cursor, 'position', this.cursor.position === null
            ? this.cursor.type === 'db'
              ? dbLen - 1
              : ddLen - 1
            : this.cursor.position - 1);
          if (this.cursor.position < 0){
            this.$set(this.cursor, 'type', this.cursor.type === 'db'
              ? this.data._dadata.length > 0
                ? 'dadata'
                : 'db'
              : this.data._db.length > 0
                ? 'db'
                : 'dadata'
            );
            this.$set(this.cursor, 'position', this.cursor.type === 'db' ? dbLen - 1 : ddLen - 1);
          }
        }
        else if( e.key === 'Enter'){
          this.enter();
        }
      },
      enter(){
        if (this.cursor.position !== null){
          if (this.cursor.type === 'db'){
            this.buttons.enter.action(this.data._db[this.cursor.position].id);
          }
          else{
            this.buttons.back.action = this.back;
            this.$set(this, 'selectedDadata', this.data._dadata[this.cursor.position]);
            this.$set(this.buttons, 'addForm', true);
          }
        }
      },
      input: _.debounce( function(val) {
        if (val.length < 3 || this.previous === this.search) return;
        this.source.runProcedure({ type: 'companySearch', params: { type: 'party', query: val } })
          .then(ans => {
            this.previous = this.search;
            this.$set(this, 'data', ans.data);

            _.forEachRight(this.data._dadata, (item, ind) => {
              if (this.data._db.find(el => el.party.inn == item.data.inn && el.party.ogrn == item.data.ogrn)){
                this.data._dadata.splice(ind, 1)
              }
            });

            this.$set(this.cursor, 'type', ans.data._db.length > 0
              ? 'db'
              : ans.data._dadata.length > 0
                ? 'dadata'
                : null);
            this.$set(this.cursor, 'position', null);
          })
      }, 500),
    },
    mounted(){
      this.$refs.input.$el.focus();
      this.buttons.back = { enable: false, action: () => {} };
      this.buttons.forward = { enable: false, action: () => {} };
      this.buttons.enter = {enable: false, action: this.enter }
    },
    watch:{
      cursor:{
        handler: function (n) {
          if(n.position !== null){
            this.buttons.enter.enable = true;
          }
        },
        deep: true
      }
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .t-select{
    margin-top: 20px;
  }
</style>