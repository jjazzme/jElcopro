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
        <template v-slot:item.price="{ item }">{{ item.price.toFixed(2) }}</template>
        <template v-slot:item.price_usd="{ item }">{{ item.price_usd.toFixed(2) }}</template>
        <template v-slot:item.sum="{ item }">{{ item.sum.toFixed(2) }}</template>
        <template v-slot:item.sum_usd="{ item }">{{ item.sum_usd.toFixed(2) }}</template>
        <template v-slot:item.for_all_price_rub="{ item }">{{ item.for_all_price_rub.toFixed(2) }}</template>
        <template v-slot:item.for_all_price_usd="{ item }">{{ item.for_all_price_usd.toFixed(2) }}</template>
    </v-data-table>
</template>

<script>
    import _ from 'lodash';
    import tableMixin from '@/mixins/tableMixin';
    import StoreSelect from '@/components/StoreSelect';

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
                }
            }
        },
        computed: {
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
            },
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