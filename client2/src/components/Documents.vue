<template>
    <v-data-table
            :headers="headers"
            :items="items"
            :server-items-length="total"
            :options.sync="options"
            :loading="loading"
            loading-text="Loading... Please wait"
    >
        <template v-slot:header.inCard>
            <v-icon>mdi-cart-outline</v-icon>
        </template>
        <template v-slot:item.inCard="{ item }">
            <v-icon v-if="inCards(item) === 'add'" @click="addToCards(item)">mdi-cart-plus</v-icon>
            <v-icon v-else-if="inCards(item) === 'remove'" @click="removeFromCards(item)">mdi-cart-minus</v-icon>
            <v-icon v-else @click="replaceInCards(item)">mdi-cart-arrow-up</v-icon>
        </template>
        <template v-slot:item.date="{ item }">
            {{ dateFormat(item.date) }}
        </template>
        <template v-slot:item.count_document_lines="{ item }">
            <router-link :to="{ name: 'document', params: { type: $route.params.type, id: item.id } }">
                {{ item.count_document_lines }}
            </router-link>
        </template>
    </v-data-table>
</template>

<script>
    import _ from 'lodash';
    import utilsMixin from '@/mixins/utilsMixin';
    import tableMixin from '@/mixins/tableMixin';

    export default {
        name: "Documentes",
        data() {
            return {
                options: {
                    filters: {

                    },
                    filterActions: {

                    },
                    scopes: ['withBuyerable', 'withSellerable', 'withStore', 'withCurrency', 'withSum']
                },
                loading: false,
                total: 0,
                items:[],
                dependent: false,
            }
        },
        mixins: [tableMixin, utilsMixin],
        methods: {
            inCards(item) {
                if (_.indexOf(['invoice', 'order'], item.document_type_id) < 0) return null;
                if (item.document_type_id === 'invoice') {
                    if (!this.$store.getters['USER/INVOICE']) return 'add';
                    if (this.$store.getters['USER/INVOICE'].id === item.id) return 'remove';
                    return 'replace';
                }
                if ( _.findIndex(this.$store.getters['USER/ORDERS'], { id: item.id }) >=0) return 'remove';
                const sellers = this.$store.getters['USER/ORDERS'].map((order) => order.sellerable_id);
                if (_.indexOf(sellers, item.sellerable_id) >= 0) return 'replace';
                return 'add';
            },
            addToCards(item) {
                if (item.document_type_id === 'invoice') {
                    this.$store.commit('USER/SET_INVOICE', item.id)
                } else {
                    this.$store.commit('USER/PUSH_ORDER', item.id)
                }
            },
            removeFromCards(item) {
                if (item.document_type_id === 'invoice') {
                    this.$store.commit('USER/CLEAR_INVOICE', item.id)
                } else {
                    this.$store.commit('USER/REMOVE_ORDER', item.id)
                }
            },
            replaceInCards(item) {
                if (item.document_type_id === 'invoice') {
                    this.$store.commit('USER/SET_INVOICE', item.id)
                } else {
                    const index = _.findIndex(this.$store.getters['USER/ORDERS'], { sellerable_id: item.sellerable_id });
                    this.$store.commit('USER/CHANGE_ORDER', { index, id: item.id})
                }
            }
        },
        beforeRouteEnter(to, from, next){
            next(vm => {
                to.query.itemsPerPage = to.query.itemsPerPage
                    ? parseInt(to.query.itemsPerPage)
                    : vm.options.itemsPerPage;
                vm.options = _.assign(vm.options, to.query);
                vm.$set(vm.options, 'documentType', to.params.type);
                vm.$store.commit('BREADCRUMBS/ITEMS', [vm.$store.getters[vm.documentType + '/BREADCRUMB']]);
            })
        },
        beforeRouteUpdate(to, from, next) {
            this.$set(this.options, 'documentType', to.params.type);
            this.$store.commit('BREADCRUMBS/ITEMS', [this.$store.getters[this.documentType + '/BREADCRUMB']]);
            next();
        }
    }
</script>

<style scoped>

</style>