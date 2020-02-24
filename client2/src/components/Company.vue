<template>
    <v-card>
        <party-select v-model="party"></party-select>
        <div>123     </div>
        <div>123     </div>
        <div>123     </div>
        <div>123     </div>
        <div>123     </div>
        <div>123     </div>
    </v-card>
</template>

<script>
    import PartySelect from '@/components/PartySelect';
    export default {
        name: "Company",
        components: { PartySelect },
        data() {
            return {
                party: null
            }
        }
    }
</script>

<style scoped>

</style>