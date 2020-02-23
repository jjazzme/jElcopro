<template>
    <v-data-table
        :headers="headers"
        :items="items"
        :server-items-length="total"
        :options.sync="options"
        :loading="loading"
        loading-text="Loading... Please wait"
        show-expand
>
    <template v-slot:item.updatedAt="{ item }">{{ date(item.updatedAt )}}</template>
    <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
            <prices :good-id="item.id" class="my-2"/>
        </td>
    </template>
</v-data-table>
</template>

<script>
    import tableMixin from '@/mixins/tableMixin';
    import Prices from '@/components/Prices';
    export default {
        name: "Goods",
        components: {Prices},
        props: ['productId'],
        data() {
            return {
                options: {
                    documentType: 'good',
                    filters: { product_id: this.productId, is_active: true },
                    filterActions: { product_id: false, is_active: false },
                    scopes: ['withStore']
                },
                loading: false,
                total: 0,
                items: [],
                dependent: true,
            }
        },
        mixins: [tableMixin],
        watch: {
            productId(val) {
                this.$set(this.options.filters, 'product_id', val);
            }
        },
    }
</script>

<style scoped>

</style>