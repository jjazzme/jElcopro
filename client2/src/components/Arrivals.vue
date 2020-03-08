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
        <template v-slot:item.documentLine.document.date="{ item }">
            {{ dateFormat(item.documentLine.document.date )}}
        </template>
    </v-data-table>
</template>

<script>
    import tableMixin from '@/mixins/tableMixin';
    import utilsMixin from '@/mixins/utilsMixin';
    export default {
        name: "Arrivals",
        props: ['goodId'],
        data() {
            return {
                options: {
                    documentType: 'arrival',
                    filters: { 'documentLine.good_id': this.goodId, ballance: 0 },
                    filterActions: { 'documentLine.good_id': false, ballance: 'gt' },
                    scopes: ['deepDocumentLine']
                },
                loading: false,
                total: 0,
                items: [],
                dependent: true,
            }
        },
        mixins: [tableMixin, utilsMixin],
        watch: {
            goodId(val) {
                this.$set(this.options.filters, 'documentLine.good_id', val);
            }
        },
    }
</script>

<style scoped>

</style>