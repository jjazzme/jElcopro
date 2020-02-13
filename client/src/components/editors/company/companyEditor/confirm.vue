<template>
  <div>
    <div>Подтверждение</div>
    <div class="t-line">
      <div class="t-key">Название: </div>
      <div class="t-value">{{value.party.name }}</div>
    </div>
    <div class="t-line">
      <div class="t-key">ИНН: </div>
      <div class="t-value">{{ value.party.inn }}</div>
    </div>
    <div class="t-line">
      <div class="t-key">ОГРН: </div>
      <div class="t-value">{{ value.party.ogrn }}</div>
    </div>

    <div class="t-line">
      <div class="t-key">Адрес: </div>
      <div class="t-value">{{ value.address.address }}</div>
    </div>
    <div class="t-line">
      <div class="t-value">{{ value.company.own ? 'Своя' : 'Чужая' }} / </div>
      <div class="t-value">{{ value.company.with_vat ? 'С НДС' : 'Без НДС' }}</div>
    </div>
    <div class="t-line">
      <div class="t-key">Телефоны: </div>
      <div class="t-value">{{ value.company.phone }}</div>
    </div>
    <div
      class="t-line"
      v-if="value.stores.length > 1"
    >
      <b-button
        variant="link"
        @click="change(ind)"
        v-for="(itm, ind) in value.stores"
      >
        {{ ind + 1 }}
      </b-button>
    </div>
    <div class="t-line">
      <div class="t-key">Склад: </div>
      <div class="t-value">{{ value.stores[storesCursor].name }}</div>
    </div>
    <div class="t-line">
      <div class="t-key">Адрес: </div>
      <div class="t-value">{{ value.stores[storesCursor].address.address }}</div>
    </div>
    <div class="t-line">
      <div class="t-key">Телефоны: </div>
      <div class="t-value">{{ value.stores[storesCursor].phone }}</div>
    </div>
    <div class="t-line">
      <div class="t-value">{{ value.stores[storesCursor].online ? 'Онлайн' : 'Оффлайн' }} / </div>
      <div class="t-value">{{ value.stores[storesCursor].is_main ? 'Основной' : 'Не основной' }} / </div>
      <div class="t-key">Иконка:</div>
      <div class="t-value">{{ value.stores[storesCursor].icon }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "confirm",
    props: {
      value: null,
    },
    data(){
      return{
        storesCursor: 0,
      }
    },
    methods:{
      change(ind){
        this.$set(this, 'storesCursor', ind)
      },
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .t-line{
    display: flex;
    flex-flow: row nowrap;
  }
</style>