<template>
    <div>
    <document-lines :document-id="$route.params.id" :key="uniqueKey" :document="document">
        <template v-slot:header>
            <document-editor v-if="document" :value="document"/>
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
        watch: {
            document: {
                handler: function(after, before) {
                    if (after && before && after.status_id !== before.status_id) this.uniqueKey++;
                },
                deep: true
            },
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