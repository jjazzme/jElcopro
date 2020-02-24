<template>
    <model-select
            model="party"
            v-model="proxy"
            label="Выбор фирмы"
            :multiple="multiple"
            :disabled="disabled"
    />
</template>

<script>
    import ModelSelect from '@/components/ModelSelect';

    export default {
        name: "PartySelect",
        components: { ModelSelect },
        props: {
            value: {
                type: [Array, Number]
            },
            multiple: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false,
            }
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