<template>
    <div>

    </div>
</template>

<script>
    import _ from 'lodash';
    import utilsMixin from '@/mixins/utilsMixin';
    export default {
        name: "Product",
        props: ['value'],
        mixins: [utilsMixin],
        data() {
            return {
                product: {},
            }
        },
        created() {
            this.product = _.cloneDeep(this.value);
        },
    }
</script>

<style scoped>

</style>