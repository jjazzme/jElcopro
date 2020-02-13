<template>
    <model-select
            v-model="proxy"
            model="currency"
            :items-per-page="-1"
            label="Валюта"
            :disabled="disabled"
    />
</template>

<script>
    import ModelSelect from '@/components/ModelSelect';

    export default {
        name: "CurrencySelect",
        components: { ModelSelect } ,
        props: {
            value: {
                type: [Array, String]
            },
            disabled: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            proxy: {
                get() {
                    return this.value
                },
                set(val) {
                    this.$emit('input', val)
                }
            },
        },
    }
</script>

<style scoped>

</style>