<template>
  <div>
    <div class="t-line">
      <div class="t-alias">Телефоны</div>
      <b-form-textarea
        rows="3"
        max-rows="6"
        v-model="value.phone"
      />
    </div>
    <div class="t-line">
      <b-form-checkbox
        v-model="value.own"
      >
        Своя компания
      </b-form-checkbox>
    </div>
    <div class="t-line">
      <b-form-checkbox
        v-model="value.with_vat"
      >
        С НДС
      </b-form-checkbox>
    </div>

  </div>
</template>

<script>
  export default {
    name: "company",
    props: {
      value: null,
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

</style>