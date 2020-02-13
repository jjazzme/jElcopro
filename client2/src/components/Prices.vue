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
        <template v-slot:item.updatedAt="{ item }">{{ date(item.createdAt )}}</template>
    </v-data-table>
</template>

<script>
    import tableMixin from '@/mixins/tableMixin';

    export default {
        name: "Prices",
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
        mixins: [tableMixin],
        watch: {
            goodId(val) {
                this.$set(this.options.filters, 'good_id', val);
            }
        },
    }
</script>

<style scoped>

</style>