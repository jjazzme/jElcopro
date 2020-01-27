<template>
    <div>
    <document-lines :document-id="$route.params.id" :key="uniqueKey">
        <template v-slot:header>
            <v-form>
                <v-menu
                        v-model="datePicker"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                        <v-text-field
                                v-model="editDocument.date"
                                label="Picker without buttons"
                                prepend-icon="mdi-calendar-edit"
                                readonly
                                v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker v-model="editDocument.date" @input="datePicker = false"></v-date-picker>
                </v-menu>
            </v-form>
            <v-chip-group class="ml-4">
                <v-chip v-if="inCards" @click="removeFromCards">
                    Удалить из карт
                    <v-icon>mdi-cart-minus</v-icon>
                </v-chip>
                <v-chip v-else>
                    Добавить в карты
                    <v-icon>mdi-cart-plus</v-icon>
                </v-chip>
                <v-chip label>
                    {{ document ? document.status_id : '' }}
                    <v-icon right>mdi-contactless-payment</v-icon>
                </v-chip>
                <v-chip v-for="transition in possibleTransitions"
                        :key="transition.name"
                        @click="executeTransition(transition)"
                >
                    {{ transition.name }}
                </v-chip>
            </v-chip-group>
        </template>
    </document-lines>
        <v-card class="py-4">
            <v-item-group>
                <v-item v-if="parent">
                    <router-link :to="parent.to">{{ parent.text }}</router-link>
                </v-item>
                <v-item v-for="child in children" :key="child.id" class="ml-4">
                    <router-link :to="child.to">{{ child.text }}</router-link>
                </v-item>
            </v-item-group>
        </v-card>
    </div>
</template>

<script>
    import _ from 'lodash';
    import utilsMixin from '@/mixins/utilsMixin';
    import DocumentLines from '@/components/DocumentLines';
    export default {
        name: "Document",
        components: { DocumentLines },
        mixins: [utilsMixin],
        data() {
            return {
                uniqueKey: 0,
                transitions: [],
                datePicker: false,
                editDocument: {},
            }
        },
        computed: {
            document() {
                return this.$store.getters[this.documentType + '/CACHE'](parseInt(this.$route.params.id));
            },
            documentType() {
                return _.toUpper(this.$route.params.type);
            },
            documentTransitions() {
                return !_.isEmpty(this.document) && !_.isEmpty(this.transitions)
                    ? _.find(this.transitions, (o) => o[this.Model])[this.Model]
                    : [];
            },
            possibleTransitions() {
                return !_.isEmpty(this.document)
                    ? _.filter(this.documentTransitions, { from: this.document.status_id })
                    : [];
            },
            Model() {
                return _.upperFirst(this.$route.params.type);
            },
            inCards() {
                if (!this.document || _.indexOf(['invoice', 'order'], this.document.document_type_id) < 0) return false;
                if (
                    this.document.document_type_id === 'invoice' &&
                    this.$store.getters['USER/INVOICE'] &&
                    this.$store.getters['USER/INVOICE'].id === this.document.id
                ) {
                    return true;
                }
                return _.findIndex(this.$store.getters['USER/ORDERS'], { id: this.document.id })>=0;
            },
            parent() {
                if (!this.document || !this.document.parent) return false;
                const parent = {};
                parent.to = {
                    name: 'document', params: { type: this.document.parent.documet_type_id, id:this.document.parent.id }
                };
                parent.text = this.documentText(this.document.parent);
                return parent;
            },
            children() {
                if (!this.document || !this.document.children) return false;
                return this.document.children.map((child) => ({
                    to: {
                        name: 'document',
                        params: { type: child.documet_type_id, id: child.id },
                    },
                    text: this.documentText(child)
                }));
            }
        },
        methods: {
            pushBreadcrumb() {
                this.getDocument().then(document => {
                    this.editDocument = document;
                    this.$store.commit(
                        'BREADCRUMBS/PUSH',
                        {
                            text: this.documentText(document),
                            disabled: true,
                        }
                    );
                });
            },
            async getDocument() {
                return await this.$store.dispatch(this.documentType + '/GET_ITEM', parseInt(this.$route.params.id));
            },
            getTransitions() {
                this.$store.dispatch('TRANSITIONS/GET').then(t => this.transitions = t);
            },
            executeTransition(transition) {
                this.$store.dispatch('TRANSITIONS/EXECUTE', { id: this.document.id, Model: this.Model, transition: transition.name })
                    .then(() => this.unique += 1)
            },
            async removeFromCards() {
                if (this.document.document_type_id === 'invoice') {
                    await this.$store.commit('USER/CLEAR_INVOICE');
                    this.$router.push({ name: 'documents', params: { type: 'invoice' } });
                } else {
                    await this.$store.commit('USER/REMOVE_ORDER', this.document.id);
                    this.$router.push({ name: 'documents', params: { type: 'order' } });
                }
            },
            documentText(document) {
                if (!document) return '';
                const documentTypes = this.$store.getters['DOCUMENTTYPES/ITEMS'];
                const documentType = _.find(documentTypes, { id: document.document_type_id });
                return documentType.name + ' № ' + document.number_prefix + '-' + document.number
                    + ' от ' + this.dateFormat(document.date);
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                vm.pushBreadcrumb();
                vm.getTransitions();
            })
        },
    }
</script>

<style scoped>

</style>