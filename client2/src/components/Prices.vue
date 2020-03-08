<template>
    <v-data-table
            :headers="headers"
            :items="items"
            :server-items-length="total"
            :options.sync="options"
            :loading="loading"
            loading-text="Loading... Please wait"
            hide-default-footer
    >
        <template v-slot:header.actions v-if="company.own">
            <v-btn @click="add" fab small><v-icon>mdi-plus</v-icon></v-btn>
        </template>
        <template v-slot:item.actions="{ item }">
            <row-actions v-if="company.own">
                <template v-slot:actions>
                    <v-btn fab dark small color="red" @click="remove(item)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </template>
            </row-actions>
        </template>
        <template v-slot:item.min="props">
            <v-edit-dialog @save="save(props.item, 'min')">
                {{ props.item.min }}
                <template v-slot:input>
                    <v-text-field
                            v-model="props.item.min"
                            :rules="minRules"
                            single-line
                            :disabled="!company.own"
                    />
                </template>
            </v-edit-dialog>
        </template>
        <template v-slot:item.max="props">
            <v-edit-dialog @save="save(props.item, 'max')">
                {{ props.item.max }}
                <template v-slot:input>
                    <v-text-field
                            v-model="props.item.max"
                            :rules="maxRules"
                            single-line
                            :disabled="!company.own"
                    />
                </template>
            </v-edit-dialog>
        </template>
        <template v-slot:item.for_all_price="props">
            <v-edit-dialog @save="save(props.item, 'for_all_price')">
                {{ props.item.for_all_price }}
                <template v-slot:input>
                    <v-text-field
                            v-model="props.item.for_all_price"
                            :rules="for_all_priceRules"
                            single-line
                            :disabled="!company.own"
                    />
                </template>
            </v-edit-dialog>
        </template>
        <template v-slot:item.updatedAt="{ item }">{{ date(item.updatedAt )}}</template>
    </v-data-table>
</template>

<script>
    import tableMixin from '@/mixins/tableMixin';
    import RowActions from './RowActions';
    import utilsMixin from '@/mixins/utilsMixin';
    export default {
        name: "Prices",
        components: { RowActions },
        props: ['goodId'],
        data() {
            return {
                options: {
                    documentType: 'price',
                    filters: { good_id: this.goodId },
                    filterActions: { good_id: false },
                    itemsPerPage: -1,
                    scopes: ['withCurrency']
                },
                loading: false,
                total: 0,
                items: [],
                dependent: true,
            }
        },
        computed: {
            minRules() {
                return [this.rules.required, this.rules.isInteger];
            },
            maxRules() {
                return [this.rules.required, this.rules.isInteger];
            },
            for_all_priceRules() {
                return [this.rules.required, this.rules.isNumber];
            },
            good() {
                return this.$store.getters['GOOD/CACHE'](this.goodId)
            },
            store() {
                return this.good.store || this.$store.getters['STORE/CACHE'](this.good.store_id);
            },
            company() {
                return this.store.company || this.$store.getters['COMPANY/CACHE'](this.store.company_id);
            }
        },
        mixins: [tableMixin, utilsMixin],
        watch: {
            goodId(val) {
                this.$set(this.options.filters, 'good_id', val);
            }
        },
        methods: {
            add() {
                const item = {
                    id: 0,
                    good_id: this.goodId,
                    currency_id: 'R01000',
                    min: 1,
                    max: 1000000,
                    our_price: 0,
                    for_all_price: 1,
                };
                this.$store.dispatch('PRICE/UPDATE_ITEM', { item })
                    .then(() => this.updateItems());
            },
        }
    }
</script>

<style scoped>

</style>