<template>
    <model-select
            model="producer"
            v-model="proxy"
            label="Выбор производителей"
            :multiple="multiple"
            :disabled="disabled"
    />
</template>

<script>
    import ModelSelect from '@/components/ModelSelect';

    export default {
        name: "ProducerSelect",
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