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
                    <producer-select v-model="options.filters.right_producer_id"  multiple/>
                </td>
            </tr>
        </template>
        <template v-slot:item.site="{ item }">
            <v-chip v-if="item.site" :href="item.site" target="_blank">{{ item.site | removeHttp }}</v-chip>
        </template>
        <template v-slot:item.rightProducer.name="props">
            <v-edit-dialog>
                {{ props.item.rightProducer? props.item.rightProducer.name : '' }}
                <template v-slot:input>
                    <producer-select v-model="props.item.right_producer_id" @input="save(props.item)"/>
                </template>
            </v-edit-dialog>
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
                total: 0,
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
                    if (this.$route.query.page === this.options.page) this.options.page = 1;
                    this.$store.dispatch('PRODUCER/GET_ITEMS', this.options)
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
        filters: {
            removeHttp(value) {
                let ret = value.replace('http:', '');
                ret = ret.replace('https:', '');
                ret = ret.replace(/\//g,'');
                return ret;
            }
        },
        methods: {
            save(item) {
                this.$store.dispatch('PRODUCER/UPDATE_ITEM', { item })
                    .then(response => {
                        const index = _.findIndex(this.items, { id: item.id });
                        this.items.splice(index, 1, response.data);
                    })
            }
        },
        beforeRouteEnter(to, from, next){
            next(vm => {
                to.query.itemsPerPage = to.query.itemsPerPage
                    ? parseInt(to.query.itemsPerPage)
                    : vm.options.itemsPerPage;
                vm.options = _.assign(vm.options, to.query);
                // eslint-disable-next-line no-console
                console.log('ENTER');
            })
        }
    }
</script>

<style scoped>

</style>