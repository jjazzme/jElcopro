<template>
    <v-form class="mx-2">
        <v-row>
            <v-col>
                <v-text-field v-model="proxy.name" label="Наименование" :disabled="false"/>
            </v-col>
            <v-col>
                <producer-select v-model="proxy.producer_id"/>
            </v-col>
            <v-col>
                <v-btn color="success" @click="save" :disabled="false">
                    <v-icon>mdi-content-save</v-icon>
                    Сохранить
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>

<script>
    import editMixin from '@/mixins/editMixin';
    import ProducerSelect from '@/components/ProducerSelect';
    export default {
        name: "ProductEditor",
        props: ['value'],
        data() {
            return {
                documentType: 'PRODUCT',
            }
        },
        components: {ProducerSelect},
        mixins: [editMixin],
    }
</script>

<style scoped>

</style>