<template>
    <company-edit v-if="company" :value="company"></company-edit>
</template>

<script>
    import CompanyEdit from '@/components/CompanyEdit';
    export default {
        name: "Company",
        components: { CompanyEdit },
        data() {
            return {

            }
        },
        computed: {
            company() {
                const answer = this.$store.getters['COMPANY/CACHE'](this.$route.name === 'company'? this.companyId : 0);
                if (!answer) {
                    this.$store.dispatch('COMPANY/GET_ITEM', this.companyId);
                }
                return answer;
            },
            companyId() {
                return parseInt(this.$route.params.id) || 0;
            }
        }
    }
</script>

<style scoped>

</style>