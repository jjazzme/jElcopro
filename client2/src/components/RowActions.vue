<template>
    <v-speed-dial :open-on-hover="true" direction="right">
        <template v-slot:activator>
            <v-btn fab icon small>
                <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
        </template>
        <slot name="actions"/>
    </v-speed-dial>
</template>

<script>
    export default {
        name: "RowActions"
    }
</script>

<style scoped>

</style>