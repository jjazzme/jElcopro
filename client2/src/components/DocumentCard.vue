<template>
    <v-card class="my-2 mx-2" :to="to">
        <v-container>
            <v-row>
                <div class="mx-2">
                    <span v-if="!documentId">ВЫБРАТЬ</span>
                </div>
            </v-row>
            <v-row>
                <div class="mx-2">
                    <v-chip v-if="!documentId && documentType === 'invoice'">СЧЕТ</v-chip>
                    <v-chip v-else-if="!documentId && documentType === 'order'">Заказ</v-chip>
                </div>
            </v-row>
            <v-row>
                <div class="mx-2">
                    Тут число строк и сумма
                </div>
            </v-row>
        </v-container>
    </v-card>
</template>

<script>
    export default {
        name: "DocumentCard",
        props: ['documentId', 'documentType'],
        computed: {
            to() {
                return this.documentId ? {} : { name: 'documents', params: { type: this.documentType } };
            }
        }
    }
</script>

<style scoped>

</style>