<template>
    <v-form class="mx-2">
        <v-row>
            <v-col>
                <party-select v-model="company.party_id"></party-select>
            </v-col>
            <v-col>
                <address-select v-model="addressId"></address-select>
            </v-col>
            <v-col>
                <v-btn @click="a=1">TEST</v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>

<script>
    import _ from 'lodash';
    import PartySelect from '@/components/PartySelect';
    import AddressSelect from '@/components/AddressSelect';
    import utilsMixin from '@/mixins/utilsMixin';

    export default {
        name: "CompanyEdit",
        components: { PartySelect, AddressSelect },
        mixins: [utilsMixin],
        props: ['value'],
        data() {
            return {
                company: {},
                party_id: 0,
                addressId: null,
            }
        },
        computed: {

        },
        created() {
            this.company = _.cloneDeep(this.value);
            this.party_id = this.company.party_id;
            this.addressId = this.company.fact_address_id;
        },
        watch: {
            value(v) {
                this.company = _.cloneDeep(v);
                this.party_id = this.company.party_id;
                this.addressId = this.company.fact_address_id;
            },
            addressId(v) {
                this.company.fact_address_id = v;
            },
            company:{
                handler: function() {
                    if (this.company.party_id !== this.party_id && this.company.party_id) {
                        this.party_id = this.company.party_id;
                        this.$store.dispatch(
                            'COMPANY/GET_ITEMS',
                            { filters: { party_id: this.company.party_id }, filterActions: { party_id: false } }
                        ).then((response) => {
                            if (response.data.rows.length > 0) {
                                this.changeRouteId(response.data.rows[0].id);
                            } else if (this.company.id > 0) {
                                const partyId = this.company.party_id;
                                this.changeRouteId(0)
                                    .then(() => {
                                        this.company.party_id = partyId;
                                    });
                            } else {
                                const address = this.$store.getters['PARTY/CACHE'](this.company.party_id)
                                    .json.data.address.unrestricted_value;
                                this.$store.dispatch('ADDRESS/GET_ITEMS', { filters: { address } })
                                    .then((response) => {
                                        if (response.data.rows.length > 0 && this.addressId !== response.data.rows[0].id) {
                                            this.addressId = response.data.rows[0].id;
                                        }
                                    })
                            }
                        });
                    }
                },
                deep: true,
            },
        },
    }
</script>

<style scoped>

</style>