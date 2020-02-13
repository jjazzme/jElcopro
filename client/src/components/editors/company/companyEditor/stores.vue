<template>
  <div>
    <div>
      Склады
      <b-button
        variant="link"
        @click="add"
      >Добавить</b-button>
    </div>
    <div class="t-stores">
      <div
        v-for="(itm, ind) in value"
        class="t-store"
      >
        <b-button
          variant="link"
          @click="change(ind)"
        >
          №{{ ind + 1 }}
        </b-button>
        <b-button
          variant="danger"
          size="sm"
          @click="del(ind)"
        >
          <fa-icon icon="times" />
        </b-button>
      </div>
    </div>
    <div
      class="t-store"
      v-if="value[cursor]"
    >
      <div>
        <div class="t-alias">Наименование</div>
        <b-form-input
          v-model="value[cursor].name"
        />
      </div>
      <div>
        <div class="t-alias">Телефоны</div>
        <b-form-textarea
          rows="3"
          max-rows="6"
          v-model="value[cursor].phone"
        />
      </div>
      <div class="t-line">
        <b-form-checkbox
          v-model="value[cursor].online"
        >
          Онлайн
        </b-form-checkbox>
        <b-form-checkbox
          v-model="value[cursor].is_main"
        >
          Основной
        </b-form-checkbox>
        <b-form-input
          class="t-icon"
          v-model="value[cursor].icon"
        />
        <div>Иконкка</div>
      </div>
      <Address
        v-model="value[cursor].address"
        :source="source"
      />
    </div>
  </div>
</template>

<script>
  import Address from "./address";
  export default {
    name: "stores",
    components: {Address},
    props: {
      value: null,
      party: null,
      source: null,
      address: null,
      addressTemplate: {
        type: Object,
        default: () => { return {
          id: 0,
          address: '',
          json: null,
        } }
      },
      storeTemplate: {
        type: Object,
        default: () => { return {
          id: 0,
          name: '',
          phone: '',
          company_id: 0,
          address_id: 0,
          address: null,
          online: false,
          is_main: true,
          icon: '',
        } }
      },
    },
    data(){
      return {
        cursor: null,
      }
    },
    methods:{
      change(ind){
        this.$set(this, 'cursor', ind);
      },
      del(ind){
        this.value.splice(ind, 1)
      },
      add(){
        const store = _.cloneDeep(this.storeTemplate);
        store.address = this.address;
        store.address_id = store.address.id;
        const num = this.value.length +1;
        store.name = `Склад ${this.party.name} №${num}`
        this.value.push(store);
      }
    },
    watch:{
      value: {
        handler: function(n){
          _.forEach(n, item => {
            item.address_id = item.address.id
          });
        },
        deep: true
      },
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .t-line{
    display: flex;
    flex-flow: nowrap row;
    > * {
      margin-right: 10px;
    }
    .t-icon{
      width: 50px;
    }
  }
  .t-stores{
    display: flex;
    flex-flow: row;
    .t-store{
      display: block;
      padding: 2px 5px;
      border: solid 1px gray;
      border-radius: 5px;
    }
  }
</style>