<template>
    <v-card class="my-2 mx-2" :to="to1">
        <v-container>
            <v-row>
                <div class="mx-2">
                    <span v-if="!documentId">ВЫБРАТЬ</span>
                    <span v-else>{{ type }} № {{ document.number_prefix }}-{{ document.number }}</span>
                </div>
            </v-row>
            <v-row>
                <div class="mx-2">
                    <v-chip v-if="!documentId">{{ type }}</v-chip>
                    <v-chip v-else>{{ contragent }}</v-chip>
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
    import _ from 'lodash';
    export default {
        name: "DocumentCard",
        props: ['documentId', 'documentType'],
        computed: {
            to1() {
                return  this.documentId
                    ? { name: 'document', params: { type: this.documentType, id: this.documentId } }
                    : { name: 'documents', params: { type: this.documentType } };
            },
            document() {
                const document = this.documentId
                    ? this.$store.getters[_.toUpper(this.documentType) + '/CACHE'](this.documentId) || {}
                    : {};
                if (!_.isEmpty(document)) {
                    if (document.status_id !== 'formed') {
                        if (document.document_type_id === 'invoice') {
                            this.$store.dispatch('USER/CLEAR_INVOICE');
                        } else {
                            this.$store.dispatch('USER/REMOVE_ORDER', document.id);
                        }
                    }
                }
                return document;
            },
            type() {
                return this.documentType === 'order' ? 'ЗАКАЗ' : 'СЧЕТ';
            },
            contragent() {
                if (_.isEmpty(this.document)) return '';
                return this.documentType === 'order'
                    ? 'От ' + this.document.sellerable.party.name
                    : 'Для ' + this.document.buyerable.party.name;
            }
        }
    }
</script>

<style scoped>

</style>