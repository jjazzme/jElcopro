<template>
    <model-select
            v-model="proxy"
            model="store"
            :items-per-page="-1"
            label="Склады"
            :filters="filters"
            :filter-actions="filterActions"
            :multiple="multiple"
            :disabled="disabled"
            :key="key"
            :dense="dense"
    />
</template>

<script>
    import ModelSelect from '@/components/ModelSelect';

    export default {
        name: "StoreSelect",
        components: { ModelSelect },
        props: {
            value: {
                type: [Array, Number]
            },
            multiple: {
                type: Boolean,
                default: false
            },
            label: String,
            companyId: Number,
            disabled: {
                type: Boolean,
                default: false,
            },
            dense: {
                type: Boolean,
                default: false,
            }
        },
        data() {
            return {
                key: 0,
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
            },
            filters() {
                return this.companyId ? { company_id: this.companyId } : {};
            },
            filterActions() {
                return this.companyId ? { company_id: false } : {};
            }
        },
        watch: {
            companyId() {
                this.key += 1;
            }
        }
    }
</script>

<style scoped>

</style>