<template>
    <document-lines :document-id="$route.params.id" :key="uniqueKey">
        <template v-slot:header>
            <v-chip-group class="ml-4">
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

</template>

<script>
    import _ from 'lodash';
    import DocumentLines from '@/components/DocumentLines';
    export default {
        name: "Document",
        components: { DocumentLines },
        data() {
            return {
                uniqueKey: 0,
                transitions: [],
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
            }
        },
        methods: {
            pushBreadcrumb() {
                this.getDocument().then(document => {
                    this.$store.commit(
                        'BREADCRUMBS/PUSH',
                        {
                            text: `ДОКУМЕНТ № ${document.number_prefix}-${document.number}`,
                            disabled: true,
                        }
                    );
                });
            },
            async getDocument() {
                return await this.$store.dispatch(this.documentType + '/CACHE', parseInt(this.$route.params.id));
            },
            getTransitions() {
                this.$store.dispatch('TRANSITIONS/GET').then(t => this.transitions = t);
            },
            executeTransition(transition) {
                this.$store.dispatch('TRANSITIONS/EXECUTE', { id: this.document.id, Model: this.Model, transition: transition.name })
                    .then(() => this.unique += 1)
            },
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