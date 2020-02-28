<template>
    <v-card>
        <party-select v-model="party"></party-select>
        <address-select v-model="address"></address-select>
    </v-card>
</template>

<script>
    import PartySelect from '@/components/PartySelect';
    import AddressSelect from '@/components/AddressSelect';
    export default {
        name: "Company",
        components: {AddressSelect, PartySelect },
        data() {
            return {
                address: null,
                party: null,
            }
        }
    }
</script>

<style scoped>

</style>