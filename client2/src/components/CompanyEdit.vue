<template>
    <v-form class="mx-2">
        <v-row>
            <v-col>
                <party-select v-model="company.party_id"></party-select>
            </v-col>
            <v-col>
                <address-select v-model="addressId"></address-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-text-field v-model="company.alias" label="Сокращенно"/>
            </v-col>
            <v-col>
                <v-switch v-model="company.own" label="Своя фирма"></v-switch>
            </v-col>
            <v-col>
                <v-btn color="success" @click="save" >
                    <v-icon>mdi-content-save</v-icon>
                    Сохранить
                </v-btn>
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
                             { filters: { party_id: this.party_id }, filterActions: { party_id: false } }
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
                                    });
                            }
                         });
                     }
                },
                deep: true,
            },
        },
        methods: {
            save() {
                this.$store.dispatch('COMPANY/UPDATE_ITEM', { item: this.company })
                    .then((response) => {
                        if (this.$route.query.back) {
                            this.$router.go(-1);
                        } else if (response.data.id !== this.company.id) {
                            this.$router.replace({ params: { id: response.data.id } });
                        }
                    });
            }
        },
        beforeRouteUpdate(to, from, next) {
            this.company = _.cloneDeep(this.value);
            this.party_id = this.company.party_id;
            this.addressId = this.company.fact_address_id;
            next();
        }
    }
</script>

<style scoped>

</style>