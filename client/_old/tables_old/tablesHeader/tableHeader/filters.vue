<template>
    <div>
        <div
            v-for="(item, i) in value"
            :key="i"
        >
            <b-input
                    v-if="item.type==='search'"
                    v-model="item.value"
                    :placeholder="item._placeholder ? item._placeholder : ''"
            ></b-input>
        </div>
    </div>
</template>

<script>
    export default {
        name: "filters",
        props: {
            value: {type: Array}
        },
    }
</script>

<style scoped>

</style>
