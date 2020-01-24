<template>
    <v-data-table
            :headers="headers"
            :items="items"
            :server-items-length="total"
            :options.sync="options"
            :loading="loading"
            loading-text="Loading... Please wait"
    />
</template>

<script>
    import _ from 'lodash';
    // import { mapGetters } from 'vuex';

    export default {
        name: "Documentes",
        data() {
            return {
                options: {
                    filters: {

                    },
                    filterActions: {

                    },
                    scopes: ['withBuyerable', 'withSellerable', 'withStore', 'withCurrency']
                },
                loading: false,
                total: 0,
                items:[],
            }
        },
        computed: {
            headers() {
                return this.$store.getters[this.documentType + '/HEADERS'];
            },
            documentType() {
                return this.options.documentType ? _.toUpper(this.options.documentType) : 'ORDER';
            }
        },
        methods: {

        },
        watch: {
            options: {
                handler: _.debounce(function() {
                    this.loading = true;
                    if (this.$route.query.page === this.options.page) this.options.page = 1;
                    this.$store.dispatch( this.documentType + '/GET_ITEMS', this.options)
                        .then((response) => {
                            this.total = response.data.count;
                            this.items = response.data.rows;
                            const newQuery = _.omit(this.options, ['filters', 'filterActions', 'scopes']);
                            if (!_.isEqual(this.$route.query, newQuery)) {
                                this.$router.replace({ name: 'producers', query: newQuery });
                            }
                        })
                        // eslint-disable-next-line no-unused-vars
                        .catch(() => {})
                        .then(() => this.loading = false)
                }, 500),
                deep: true
            }
        },
        beforeRouteEnter(to, from, next){
            next(vm => {
                to.query.itemsPerPage = to.query.itemsPerPage
                    ? parseInt(to.query.itemsPerPage)
                    : vm.options.itemsPerPage;
                vm.options = _.assign(vm.options, to.query);
                vm.options.documentType = to.params.type;
                // eslint-disable-next-line no-console
                console.log('ENTER');
            })
        },
        beforeRouteUpdate(to, from, next) {
            this.options.documentType = to.params.type;
            next();
        }
    }
</script>

<style scoped>

</style>