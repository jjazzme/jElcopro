<template>
    <v-data-table
            :headers="computedHeaders"
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
            <row-actions>
                <template v-slot:actions>
                    <v-btn fab dark small color="red" @click="remove(item)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </template>
            </row-actions>
        </template>
        <template v-slot:item.good.product.name="{ item }">
            <router-link :to="{ name: 'product', params: { id: item.good.product_id } }">
                {{ item.good.product.name }}
            </router-link>
        </template>
        <template v-slot:item.reserve="{ item }">
            {{ item.futureReserve ? item.futureReserve.ballance : 0 }} / {{ reserveQuantity(item, false) }} / {{ reserveQuantity(item, true) }}
        </template>
        <template v-slot:item.inTransfers="{ item }">
            {{ childrenQuantity(item) }}
        </template>
        <template v-slot:item.quantity="props">
            <v-edit-dialog @save="save(props.item, 'quantity')">
                {{ props.item.quantity }}
                <template v-slot:input>
                    <v-text-field
                            v-model="props.item.quantity"
                        :rules="quantityRules"
                        single-line
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
    import utilsMixin from '@/mixins/utilsMixin';
    export default {
        components: {RowActions},
        props: ['documentId', 'document'],
        name: "DocumentLines",
        mixins: [utilsMixin, tableMixin],
        data() {
            return {
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
        computed: {
            quantityRules() {
                return [this.rules.required, this.rules.isInteger];
            },
            inTransfers() {
                if (!this.document) return false;
                return ['invoice', 'order'].indexOf(this.document.document_type_id) >= 0;
            },
            needParent() {
                if (!this.document) return false;
                return ['transfer-in', 'transfer-out'].indexOf(this.document.document_type_id) >= 0;
            },
            needReserve() {
                if (!this.document) return false;
                return ['invoice'].indexOf(this.document.document_type_id) >= 0;
            },
            computedHeaders() {
                const headers = _.cloneDeep(this.headers);
                if (!this.inTransfers) _.remove(headers, { value: 'inTransfers'});
                if (!this.needParent) _.remove(headers, { value: 'parent.quantity'});
                if (!this.needReserve) _.remove(headers, { value: 'reserve'});
                return headers;
            }
        },
        watch: {
            documentId(val) {
                this.$set(this.options.filters, 'document_id', val);
            }
        },
        methods: {
            save(item, attr) {
                const validate = this[attr + 'Rules'].reduce((res, f) => res && f(item[attr]) === true, true);
                if (validate) {
                    this.$store.dispatch(this.documentType + '/UPDATE_ITEM', {item})
                        .then((response) => {
                            const index = _.findIndex(this.items, { id: item.id });
                            this.items.splice(index, 1, response.data);
                        })
                        .catch(() => this.restore(item));
                } else {
                    const error = this[attr + 'Rules'].reduce((res, f) =>
                        res === true ? f(item[attr]) : res, true
                    );
                    this.restore(item);
                    this.$store.commit(
                        'SNACKBAR/SET',
                        { text: error, color: 'error', snackbar: 'true'},
                    );
                }
            },
            restore(item) {
                const restore = this.$store.getters[this.documentType + '/CACHE'](item.id);
                const index = _.findIndex(this.items, { id: item.id });
                this.items.splice(index, 1, restore);
            },
            requestParams() {
                const requestParams = _.cloneDeep(this.options);
                if (this.inTransfers) requestParams.scopes.push('withChildren');
                if (this.needParent) requestParams.scopes.push('withParent');
                if (this.needReserve) {
                    requestParams.scopes = _.union(requestParams.scopes, ['withReserves', 'withFutureReserve']);
                }
                return requestParams;
            },
            childrenQuantity(item) {
                return item.children
                    ? item.children.reduce((sum, item) => sum += item.quantity, 0)
                    : 0;
            },
            reserveQuantity(item, closed) {
                return item.reserves
                    ? item.reserves
                        .map((item) => item.closed === closed)
                        .reduce((sum, item) => sum += item.quantity, 0)
                    : 0;
            }
        },
    }
</script>

<style scoped>

</style>