<template>
    <div v-if="product">
        <product-editor v-model="product"/>
        <goods :product-id="product.id"/>
    </div>
</template>

<script>
    import utilsMixin from '@/mixins/utilsMixin';
    import ProductEditor from '@/components/ProductEditor';
    import Goods from '@/components/Goods';

    export default {
        name: "Product",
        components: {Goods, ProductEditor},
        mixins: [utilsMixin],
        data() {
            return {

            }
        },
        computed: {
            product() {
                const product = this.$store.getters['PRODUCT/CACHE'](parseInt(this.$route.params.id));
                if (product) return product;
                const id = parseInt(this.$route.params.id);
                if (id) this.$store.dispatch('PRODUCT/GET_ITEM', id);
                return null;
            }
        }
    }
</script>

<style scoped>

</style>