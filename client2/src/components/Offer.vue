<template>
    <v-data-table
            :headers="headers"
            :items="filtredItems"
            :server-items-length="total"
            :options.sync="options"
            :loading="loading"
            loading-text="Loading... Please wait"
    >
        <template v-slot:top class="d-flex flex-row">
            <v-container>
                <v-row>
                    <v-text-field v-model="options.filters.name" label="Наименование" class="mx-1"/>
                    <v-switch v-model="filters.more_or_equal" label=">=" class="mx-1"/>
                    <v-text-field v-model="quantity" label="Количество" class="mx-1"/>
                    <store-select v-model="options.filters.from_store_ids" multiple class="mx-1" dense/>
                </v-row>
            </v-container>
        </template>
        <template v-slot:body.prepend>
            <tr>
                <td>
                    <v-autocomplete
                            :auto-select-first="true"
                            :chips="true"
                            :deletable-chips="true"
                            v-model="filters.stores"
                            :items="stores"
                            hide-no-data
                            hide-selected
                            label="Склады"
                            :multiple="true"
                    />
                </td>
                <td/>
                <td/>
                <td/>
                <td>
                    <v-autocomplete
                            :auto-select-first="true"
                            :chips="true"
                            :deletable-chips="true"
                            v-model="filters.producers"
                            :items="producers"
                            hide-no-data
                            hide-selected
                            label="Производители"
                            :multiple="true"
                    />
                </td>
            </tr>
        </template>
        <template v-slot:item.name="{ item }">
            <router-link :to="{ name: 'product', params: { id: item.product_id } }">
                {{ item.name }}
            </router-link>
        </template>
        <template v-slot:item.price="{ item }">{{ item.price.toFixed(2) }}</template>
        <template v-slot:item.price_usd="{ item }">{{ item.price_usd.toFixed(2) }}</template>
        <template v-slot:item.sum="{ item }">{{ item.sum.toFixed(2) }}</template>
        <template v-slot:item.sum_usd="{ item }">{{ item.sum_usd.toFixed(2) }}</template>
        <template v-slot:item.for_all_price_rub="{ item }">
            <v-row>
                <v-edit-dialog>
                    <div class="mt-2 mr-2">
                        {{ item.for_all_price_rub }}
                    </div>
                    <template v-slot:input>
                        <v-text-field v-model="item.for_all_price_rub" @input="render(item)"/>
                   </template>
                </v-edit-dialog>
                <v-btn icon :disabled="toInvoicePossible(item)" @click="toDocument(item, 'invoice')">
                    <v-icon>mdi-cart-plus</v-icon>
                </v-btn>
                <v-btn icon :disabled="toOrdersPossible(item)" @click="toDocument(item, 'order')">
                    <v-icon>mdi-cart-arrow-up</v-icon>
                </v-btn>
            </v-row>
        </template>
        <template v-slot:item.for_all_price_usd="{ item }">{{ item.for_all_price_usd.toFixed(2) }}</template>
    </v-data-table>
</template>

<script>
    import _ from 'lodash';
    import tableMixin from '@/mixins/tableMixin';
    import StoreSelect from '@/components/StoreSelect';
    import { mapGetters } from 'vuex';

    export default {
        name: "Offer",
        components: { StoreSelect },
        data() {
            return {
                options: {
                    filters: {
                        name: '',
                        from_store_ids: [],
                    },
                    filterActions: {
                        name: 'contains',
                        from_store_ids: 'in',
                    },
                    documentType: 'offer',
                    itemsPerPage: -1,
                },
                loading: false,
                total: 0,
                items:[],
                dependent: false,
                quantity: 1,
                filters: {
                    name: '',
                    stores: [],
                    producers: [],
                    more_or_equal: false
                },
                renderForce: true
            }
        },
        computed: {
            ...mapGetters({
                user: 'USER/GET',
                offers: 'OFFER/ITEMS',
            }),
            filtredItems() {
                return this.$store.getters['OFFER/FILTRED_ITEMS'](this.filters);
            },
            stores() {
                return _.uniqBy(this.items.map((item) => ({ value: item.store_id, text: item.store_name })), 'value');
            },
            producers() {
                return _.uniqBy(
                    this.items.map((item) => ({ value: item.producer_id, text: item.producer_name })),
                    'value',
                );
            }
        },
        mixins: [tableMixin],
        watch: {
            quantity(q) {
                this.$store.commit('OFFER/SET_QUANTITY', q);
                this.$store.commit('OFFER/SET_SUM', this.$store.getters['CURRENCY-RATE/ITEMS']);
                this.$store.commit('OFFER/SORT');
            },
            offers() {
                this.total = this.offers.length;
            }
        },
        methods: {
            render(item) {
                const { original_index } = item;
                const newItem = _.omit(_.toPlainObject(item), 'original_index');
                this.items.splice(original_index, 1, newItem);
            },
            toInvoicePossible() {
                return !this.user.cards.invoice;
            },
            toOrdersPossible(item) {
                return this.user.cards.orders
                    .map((order) => this.$store.getters['ORDER/CACHE'](order).sellerable_id)
                    .indexOf(item.company_id) < 0;
            },
            toDocument(item, documentType){
                // const payload = { priceLine: item };
                const documentId = documentType === 'order'
                    ? _.find(
                        this.user.cards.orders
                            .map((order) => this.$store.getters['ORDER/CACHE'](order)),
                        { sellerable_id: item.company_id },
                    ).id
                    : this.user.cards.invoice;
                const ourPrice = documentType === 'invoice';
                this.$store
                    .dispatch(
                        'DOCUMENTLINE/UPDATE_ITEM',
                        { item: { id: 0, priceLine: item, documentId, ourPrice } }
                    );
            }
        },
        beforeRouteEnter(to, from, next){
            next(vm => {
                vm.$store.commit('BREADCRUMBS/ITEMS', [vm.$store.getters[vm.documentType + '/BREADCRUMB']]);
            })
        },
    }
</script>

<style scoped>

</style>