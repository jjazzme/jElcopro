<template>
    <v-expansion-panels>
        <v-expansion-panel :disabled="disabled">
            <v-expansion-panel-header>{{ document.status_id }}</v-expansion-panel-header>
            <v-expansion-panel-content>
                <v-chip-group class="ml-4">
                    <v-chip v-for="transition in possibleTransitions"
                            :key="transition.name"
                            @click="executeTransition(transition)"
                    >
                        {{ transition.name }}
                    </v-chip>
                </v-chip-group>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: "DocumentTransition",
        props: ['document', 'disabled'],
        created() {
            this.getTransitions();
        },
        computed: {
            transitions() {
                return this.$store.getters['TRANSITIONS/ITEMS'];
            },
            documentTransitions() {
                return !_.isEmpty(this.document) && !_.isEmpty(this.transitions)
                    ? _.find(this.transitions, (o) => o[this.Model])[this.Model]
                    : [];
            },
            possibleTransitions() {
                return !_.isEmpty(this.document)
                    ? _.filter(this.documentTransitions, {from: this.document.status_id})
                    : [];
            },
            Model() {
                return this.$route.params.type.split('-').map((v) => _.upperFirst(v)).reduce((r, v) => r += v, '');
            },
        },
        methods: {
            getTransitions() {
                this.$store.dispatch('TRANSITIONS/GET');
            },
            executeTransition(transition) {
                this.$store.dispatch(
                    'TRANSITIONS/EXECUTE',
                    {id: this.document.id, Model: this.Model, transition: transition.name}
                );
            },
        }
    }
</script>

<style scoped>

</style>