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
                    <v-text-field v-model="options.filters.producerName" label="Продюсер"/>
                </td>
                <td/>
            </tr>
        </template>
        <template v-slot:item.site="{ item }">
            <v-chip v-if="item.site" :href="item.site" target="_blank">{{ item.site | removeHttp }}</v-chip>
        </template>
    </v-data-table>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        name: "Producers",
        data() {
            return {
                loading: false,
                total: 300,
                options: {
                    filters: {
                        producerName: ''
                    },
                },
                producerName: '',
                items: [
                    { name: 'MAX', site: 'http://www.max.com' },
                    { name: 'TI', site: 'http://www.ti.com' },
                    { name: 'ОРЕЛ', site: 'http://www.orel.com' }
                ]
            }
        },
        computed: {
            ...mapGetters({ headers: 'PRODUCER/HEADERS'})
        },
        watch: {
            options: {
                handler() {
                    this.$store.dispatch('PRODUCER/GET_ITEMS', this.options)
                    .then((response) => {
                        this.total = response.data.count;
                        this.items = response.data.rows;
                    })
                    // eslint-disable-next-line no-console
                    // console.log('HANDLER')
                },
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
        beforeRouteEnter(to, from, next) {
            // eslint-disable-next-line no-console
            // console.log('Enter')
            next(vm => {
                // eslint-disable-next-line no-console
                console.log(vm.options)
            })
        },
        beforeRouteUpdate(to, from, next) {
            // eslint-disable-next-line no-console
            // console.update('Update')
            // eslint-disable-next-line no-console
            // console.log(this.options)
        }
    }
</script>

<style scoped>

</style>