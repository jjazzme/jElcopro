<template>
    <div>
    <document-lines :document-id="$route.params.id" :key="uniqueKey">
        <template v-slot:header>
            <document-editor v-if="document" :value="document"/>
            <v-chip-group class="ml-4">
                <v-chip v-if="inCards && toCardsPossible" @click="removeFromCards">
                    Удалить из карт
                    <v-icon>mdi-cart-minus</v-icon>
                </v-chip>
                <v-chip v-else-if="toCardsPossible" @click="addToCards">
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
    import DocumentEditor from '@/components/DocumentEditor';
    export default {
        name: "Document",
        components: { DocumentEditor, DocumentLines },
        mixins: [utilsMixin],
        data() {
            return {
                uniqueKey: 0,
                transitions: [],
            }
        },
        computed: {
            document() {
                if (!this.documentType) return {};
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
                return this.$route.params.type.split('-').map((v) => _.upperFirst(v)).reduce((r, v) => r += v, '');
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
                    name: 'document', params: { type: this.document.parent.document_type_id, id:this.document.parent.id }
                };
                parent.text = this.documentText(this.document.parent);
                return parent;
            },
            children() {
                if (!this.document || !this.document.children) return false;
                return this.document.children.map((child) => ({
                    to: {
                        name: 'document',
                        params: { type: child.document_type_id, id: child.id },
                    },
                    text: this.documentText(child)
                }));
            }
        },
        methods: {
            pushBreadcrumb(params) {
                this.getDocument(params).then(document => {
                    this.$store.commit(
                        'BREADCRUMBS/PUSH',
                        {
                            text: this.documentText(document),
                            disabled: true,
                        }
                    );
                });
            },
            changeBreadcrumb(params) {
                this.$store.commit('BREADCRUMBS/POP');
                this.pushBreadcrumb(params);
            },
            async getDocument(params) {
                return await this.$store.dispatch(_.toUpper(params.type) + '/GET_ITEM', parseInt(params.id));
            },
            getTransitions() {
                this.$store.dispatch('TRANSITIONS/GET').then(t => this.transitions = t);
            },
            executeTransition(transition) {
                this.$store.dispatch('TRANSITIONS/EXECUTE', { id: this.document.id, Model: this.Model, transition: transition.name })
                    .then(() => this.unique += 1)
            },
            removeFromCards() {
                if (this.document.document_type_id === 'invoice') {
                    this.$store.commit('USER/CLEAR_INVOICE');
                    // this.$router.push({ name: 'documents', params: { type: 'invoice' } });
                } else {
                    this.$store.commit('USER/REMOVE_ORDER', this.document.id);
                    // this.$router.push({ name: 'documents', params: { type: 'order' } });
                }
            },
            async addToCards() {
                if (this.document.document_type_id === 'invoice') {
                    this.$store.commit('USER/SET_INVOICE', this.document.id)
                } else {
                    this.$store.commit('USER/PUSH_ORDER', this.document.id);
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
                vm.pushBreadcrumb(to.params);
                vm.getTransitions();
            })
        },
        beforeRouteUpdate(to, from, next) {
            this.changeBreadcrumb(to.params);
            next();
        }
    }
</script>

<style scoped>

</style>