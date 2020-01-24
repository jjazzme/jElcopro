<template>
    <v-data-table
            :headers="headers"
            :items="items"
            :server-items-length="total"
            :options.sync="options"
            :loading="loading"
            loading-text="Loading... Please wait"
    >
        <template v-slot:body.prepend>
            <tr>
                <td>
                    <v-text-field v-model="options.filters.name" label="введите наименование"/>
                </td>
                <td/>
                <td>
                    <producer-select v-model="options.filters.right_producer_id" multiple/>
                </td>
            </tr>
        </template>
        <template v-slot:item.site="{ item }">
            <v-chip v-if="item.site" :href="item.site" target="_blank">{{ item.site | removeHttp }}</v-chip>
        </template>
    </v-data-table>
</template>

<script>
    import _ from 'lodash'
    import { mapGetters } from 'vuex';
    import ProducerSelect from '@/components/ProducerSelect';

    export default {
        name: "Producers",
        components: {ProducerSelect},
        data() {
            return {
                loading: false,
                total: 300,
                options: {
                    filters: {
                        name: '',
                        right_producer_id: [],
                    },
                    filterActions: {
                        name: 'substring',
                        right_producer_id: 'in',
                    },
                    scopes: ['withRightProducer']
                },
                producerName: '',
                items: [],
            }
        },
        computed: {
            ...mapGetters({ headers: 'PRODUCER/HEADERS'})
        },
        watch: {
            options: {
                handler: _.debounce(function() {
                    this.loading = true;
                    this.$store.dispatch('PRODUCER/GET_ITEMS', this.options)
                        .then((response) => {
                            this.total = response.data.count;
                            this.items = response.data.rows;
                            this.$router.replace(
                                { name: 'producers', query: _.omit(this.options, ['filters', 'filterActions', 'scopes']) }
                            );
                        })
                        // eslint-disable-next-line no-unused-vars
                        .catch(error => {})
                        .then(() => this.loading = false)
                }, 500),
                deep: true
            }
        },
        filters: {
            removeHttp(value) {
                let ret = value.replace('http:', '');
                ret = ret.replace('https:', '');
                ret = ret.replace(/\//g,'');
                return ret;
            }
        },
        beforeRouteEnter(to, from, next){
            next(vm => {
                to.query.itemsPerPage = to.query.itemsPerPage
                    ? parseInt(to.query.itemsPerPage)
                    : vm.options.itemsPerPage;
                vm.options = _.assign(vm.options, to.query)

            })
        }
    }
</script>

<style scoped>

</style>