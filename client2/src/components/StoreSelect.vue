<template>
    <v-autocomplete
            :auto-select-first="true"
            :clearable="!multiple"
            :chips="multiple"
            :deletable-chips="multiple"
            v-model="proxy"
            :items="items"
            item-text="name"
            item-value="id"
            :loading="isLoading"
            :search-input.sync="search"
            hide-no-data
            hide-selected
            :label="label"
            placeholder="Start typing to Search"
            :multiple="multiple"
    />
</template>

<script>
    import _ from 'lodash'

    export default {
        name: "StoreSelect",
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
        },
        data() {
            return {
                model: null,
                items: [],
                isLoading: false,
                search: null,
            }
        },
        created() {
            if (this.value)
                this.$store.dispatch('STORE/CACHE', this.value).then((store) => this.items.push(store));
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
        watch: {
            search: _.debounce(function(val) {
                if (!val || this.isLoading) return;
                const options = {
                    page: 1, itemsPerPage: 10, filters: { name: val, company_id: this.companyId },
                    filterActions: { name: 'substring', company_id: false }, sortBy: ['name'], sortDesc: ['false'],
                };
                this.isLoading = true;
                this.$store.dispatch('STORE/GET_ITEMS', options)
                    .then((response) => {
                        const filtred = _.isArray(this.value)
                            ? this.items.filter((item) => this.value.indexOf(item.id) >= 0)
                            : [];
                        this.items = _.union(response.data.rows, filtred);
                    })
                    // eslint-disable-next-line no-unused-vars
                    .catch(() => {})
                    .then(() => this.isLoading = false)
            }, 500)
        }
    }
</script>

<style scoped>

</style>