<template>
  <div>
    <div class="t-line">
      <div class="t-alias">
        Адрес
        <b-button
          v-if="value.id === 0"
          @click="add"
          variant="link"
        >
          Добавить
        </b-button>
      </div>
      <b-form-textarea
        :class="{ 't-text': true, 't-add': value.id === 0 }"
        rows="2"
        max-rows="2"
        v-model="value.address"
        @keydown.native="keypress"
        ref="input"
      />
      <select-address
        v-model="value"
        :data="data"
        :cursor="cursor"
        class="t-select"
      />
    </div>
  </div>
</template>

<script>
  import SelectAddress from "../selectAddress";
  export default {
    name: "Address",
    components: {SelectAddress},
    props: {
      value: null,
      source: null,
    },
    data(){
      return{
        data: null,
        cursor: { value: null },
        previous: null,
      }
    },
    computed:{
      buttonText(){ return this.value.id === 0 ? 'Добавить' : 'Изменить' }
    },
    methods:{
      add(){
        this.source.updateItem({ type: 'Address', item: this.value })
        .then(ans => {
          this.value.id = ans.data.id;
        });
      },
      keypress(e){
        if (!this.data?.length) return;
        if( e.key === 'Enter'){
          e.preventDefault();
          this.enter();
          return;
        }
        let vector = e.key === 'ArrowDown'
          ? 1
          : e.key === 'ArrowUp'
            ? -1
            : 0;
        if (vector === 0) return;
        e.preventDefault();
        let cursor = this.cursor.value + vector;
        if (cursor < 0) cursor = this.data.length - 1;
        if (cursor >= this.data.length) cursor = 0;
        this.cursor.value = this.cursor.value === null ? 0 : cursor;
      },
      enter(){
        if (this.cursor.value !== null){
          this.$set(this.value, 'address', this.data[this.cursor.value].unrestricted_value);
          this.$set(this.value, 'json', this.data[this.cursor.value]);
          //this.input(this.value.address);
        }
      },
      input: _.debounce( function(val) {
        if (val.length < 3 || this.previous === this.value.address) return;
        this.source.runProcedure({ type: 'companySearch', params: { type: 'address', query: val } })
          .then(ans => {
            this.previous = this.search;
            this.$set(this, 'data', ans.data._dadata);
            this.cursor.value = null;
            //this.$set(this.cursor.value, null);
          });
        this.source.getSourceByOptics({ type: 'Address', optics: { where: { address: val } }, onlyThis: true })
          .then(ans => {
            if (ans.rows.length > 0) {
              this.value.id = ans.rows[0].id;
              this.value.json = ans.rows[0].json;
            } else {
              this.value.id = 0;
            }
          });
      }, 500),
    },
    mounted(){
      this.$refs.input.$el.focus();
      if ( this.value.address.length > 2 ) {
        this.input(this.value.address);
        this.source.getSourceByOptics({ type: 'Address', optics: { where: { address: this.value.address } }, onlyThis: true })
        .then(ans => {
          if (ans.rows.length > 0) {
            this.value.id = ans.rows[0].id;
            this.value.json = ans.rows[0].json;
          }
        });
      }
    },
    watch:{
      'value.address'(n){
        this.input(n)
      },
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .t-add{
    color: red;
  }
</style>