<template>
    <document-lines :document-id="$route.params.id" :key="uniqueKey"/>
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
                return this.$store.getters[this.documentType + '/CACHE'](this.$route.params.id);
            },
            documentType() {
                return _.toUpper(this.$route.params.type);
            },
            documentTransitions() {
                return !_.isEmpty(this.document) && !_.isEmpty(this.transitions)
                    ? _.find(this.transitions, (o) => {
                        // eslint-disable-next-line no-debugger
                        debugger
                        o[_.upperFirst(this.$route.params.type)]
                    })
                    : [];
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
                return await this.$store.dispatch(this.documentType + '/CACHE', this.$route.params.id);
            },
            getTransitions() {
                this.$store.dispatch('TRANSITIONS/GET').then(t => this.transitions = t);
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