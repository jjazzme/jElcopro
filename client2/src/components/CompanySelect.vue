<template>
    <model-select
            model="company"
            v-model="proxy"
            :multipe="multiple"
            :label="label"
            item-text="party.name"
            :disabled="disabled"
            :filters="filters"
            :filter-actions="filterActions"
    />
</template>

<script>
    import ModelSelect from '@/components/ModelSelect';

    export default {
        name: "CompanySelect",
        components: { ModelSelect },
        props: {
            value: {
                type: [Array, Number]
            },
            multiple: {
                type: Boolean,
                default: false
            },
            label: {
                type: String,
                default: 'Компания'
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            filters: { type: Object, default: () => {} },
            filterActions: { type: Object, default: () => {} },
        },
        computed: {
            proxy: {
                get() {
                    return this.value
                },
                set(val) {
                    this.$emit('input', val)
                }
            }
        },
    }
</script>

<style scoped>

</style>