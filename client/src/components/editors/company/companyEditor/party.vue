<template>
  <div>
    <div class="t-line">
      <div class="t-alias">Наименование</div>
      <b-form-input
        v-model="value.name"
      />
    </div>
    <div class="t-line">
      <div class="t-alias">ИНН</div>
      <b-form-input
        v-model="value.inn"
      />
    </div>
    <div class="t-line">
      <div class="t-alias">ОГРН</div>
      <b-form-input
        v-model="value.ogrn"
      />
    </div>
  </div>
</template>

<script>
  export default {
    name: "companyParty",
    props: {
      value: null,
    },
    computed:{

    },
    mounted(){

    },

  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
</style>