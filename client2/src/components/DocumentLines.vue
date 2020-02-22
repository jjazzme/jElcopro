<template>
    <v-data-table
            :headers="headers"
            :items="items"
            :server-items-length="total"
            :options.sync="options"
            :loading="loading"
            loading-text="Loading... Please wait"
    >
        <template v-slot:top>
            <slot name="header"></slot>
        </template>
        <template v-slot:item.actions="{ item }">
            <row-actions></row-actions>
        </template>
        <template v-slot:item.good.product.name="{ item }">
            <router-link :to="{ name: 'product', params: { id: item.good.product_id } }">
                {{ item.good.product.name }}
            </router-link>
        </template>
        <template v-slot:item.quantity="props">
            <v-edit-dialog>
                {{ props.item.quantity }}
                <template v-slot:input>
                    <v-text-field
                        v-model="props.item.quantity"
                        :rules="[isNumber]"
                        single-line
                        @change="save(props.item)"
                    />
                </template>
            </v-edit-dialog>
        </template>
    </v-data-table>
</template>

<script>
    import _ from 'lodash'
    import tableMixin from '@/mixins/tableMixin';
    import RowActions from '@/components/RowActions';

    export default {
        components: {RowActions},
        props: ['documentId'],
        name: "DocumentLines",
        data() {
            return {
                isNumber: n => isNaN(n) || 'Введите целое число',
                options: {
                    documentType: 'documentline',
                    filters: { document_id: this.documentId },
                    filterActions: { document_id: false },
                    scopes: ['withGood']
                },
                loading: false,
                total: 0,
                items: [],
                dependent: true,
            }
        },
        mixins: [tableMixin],
        watch: {
            documentId(val) {
                this.$set(this.options.filters, 'document_id', val);
            }
        },
        methods: {
            save(item) {
                this.$store.dispatch(this.documentType + '/UPDATE_ITEM', { item })
                    .then(response => {
                        const index = _.findIndex(this.items, { id: item.id });
                        this.items.splice(index, 1, response.data);
                    })
            },
        },
    }
</script>

<style scoped>

</style>