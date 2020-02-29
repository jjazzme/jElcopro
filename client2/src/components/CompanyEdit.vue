<template>
    <v-form class="mx-2">
        <v-row>
            <v-col>
                <party-select v-model="company.party_id"></party-select>
            </v-col>
            <v-col>
                <address-select v-model="company.fact_address_id"></address-select>
            </v-col>
        </v-row>
    </v-form>
</template>

<script>
    import _ from 'lodash';
    import PartySelect from '@/components/PartySelect';
    import AddressSelect from '@/components/AddressSelect';
    export default {
        name: "CompanyEdit",
        components: { PartySelect, AddressSelect },
        props: ['value'],
        data() {
            return {
                company: {},
            }
        },
        created() {
            this.company = _.cloneDeep(this.value);
        },
        watch: {
            value(v) {
                this.company = _.cloneDeep(v);
            },
            company:{
                handler: function() {
                    if (this.company.party_id !== this.value.party_id && this.company.party_id) {
                        this.$store.dispatch(
                            'COMPANY/GET_ITEMS',
                            { filters: { party_id: this.company.party_id }, filterActions: { party_id: false } }
                        ).then((response) => {
                            if (response.data.rows.length > 0) {
                                const newRoute = _.pick(this.$route, ['name', 'params', 'query']);
                                newRoute.params.id = response.data.rows[0].id;
                                this.$router.replace(newRoute);
                            }
                        });
                        // const party = this.$store.getters['PARTY/CACHE'](after.party_id);
                    }
                },
                deep: true,
            },
        },
    }
</script>

<style scoped>

</style>