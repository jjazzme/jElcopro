<template>
    <v-data-table
            :headers="headers"
            :items="items"
            :server-items-length="total"
            :options.sync="options"
            :loading="loading"
            loading-text="Loading... Please wait"
    >
        <template v-slot:item.date="{ item }">
            <div>{{ dateFormat(item.date) }}</div>
        </template>
        <template v-slot:item.number="{ item }">
            <router-link :to="{ name: 'document', params: { type: $route.params.type, id: item.id } }">
                {{ item.number }}
            </router-link>
        </template>
    </v-data-table>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
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
        mixins: [tableMixin],
        methods: {
            dateFormat(date) {
                return moment(date).format('D/MM/Y');
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