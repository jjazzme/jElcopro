<template>
    <v-autocomplete
            :auto-select-first="true"
            :clearable="!multiple"
            :chips="multiple"
            :deletable-chips="multiple"
            v-model="proxy"
            :items="items"
            :item-text="itemText"
            :item-value="itemValue"
            :loading="isLoading"
            :search-input.sync="search"
            hide-no-data
            hide-selected
            :label="label"
            placeholder="набери что-то для поиска"
            :multiple="multiple"
            :disabled="disabled"
            :dense="dense"
            :no-filter="true"
            :error="!proxy"
    >
        <template v-slot:prepend>
            <slot name="prepend"></slot>
        </template>
    </v-autocomplete>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: "ModelSelect",
        props: {
            value: { type: [Array, Number, String] },
            multiple: { type: Boolean, default: false },
            label: { type: String, required: true },
            itemText: { type: String, default: 'name' },
            itemValue: { type: String, default: 'id' },
            model: { type: String, required: true },
            itemsPerPage: { type: Number, default: 10 },
            filters: { type: Object, default: () => {} },
            filterActions: { type: Object, default: () => {} },
            disabled: { type: Boolean, default: false },
            dense: { type: Boolean, default: false },
        },
        data() {
            return {
                items: [],
                isLoading: false,
                search: '',
            }
        },
        created() {
            if (this.itemsPerPage < 0) {
                this.getItems();
            }
            if (this.value) {
                if (_.isArray(this.value) && this.value.length > 0) {
                    this.isLoading = true;
                    this.$store.dispatch(this.MODEL + '/GET_ITEMS', {
                        itemsPerPage: -1,
                        filters: { [this.itemValue]: this.value },
                        filterActions: { [this.itemValue]: 'in' },
                        sortBy: [this.itemText],
                        sortDesc: ['false'],
                    })
                        .then((models) => models.forEach((model) => this.items.push(model)))
                        // eslint-disable-next-line no-unused-vars
                        .catch(() => {})
                        .then(() => this.isLoading = false);
                } else {
                    this.getItem();
                }
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
            MODEL() {
                return _.toUpper(this.model);
            }
        },
        watch: {
            search: _.debounce(function(val) {
                if (!val || this.isLoading || this.itemsPerPage < 0) return;
                const proxy = this.$store.getters[this.MODEL + '/CACHE'](this.value);
                if (this.value && val === _.property(this.itemText)(proxy)) return;
                this.getItems(val);
            }, 500),
            value() {
                this.getItem();
            },
        },
        methods: {
            getItems(val = '') {
                const options = {
                    page: 1,
                    itemsPerPage: this.itemsPerPage,
                    filters: _.assign({}, this.filters, { [this.itemText]: val }),
                    filterActions: _.assign({}, this.filterActions, { [this.itemText]: 'substring' }),
                    sortBy: [this.itemText],
                    sortDesc: ['false'],
                };
                this.isLoading = true;
                this.$store.dispatch(this.MODEL + '/GET_ITEMS', options)
                    .then((response) => {
                        const filtred = _.isArray(this.value)
                            ? this.items.filter((item) => this.value.indexOf(item.id) >= 0)
                            : [];
                        this.items = _.union(response.data.rows, filtred);
                    })
                    .then(() => this.isLoading = false);
            },
            getItem() {
                if (this.value && !_.isArray(this.value)) {
                    this.isLoading = true;
                    this.$store.dispatch(this.MODEL + '/CACHE', this.value)
                        .then((model) => {
                            if (!_.find(this.items, {id: model.id}))
                                this.items.push(model)
                        })
                        .then(() => this.isLoading = false);
                }
            }
        }
    }
</script>

<style scoped>

</style>