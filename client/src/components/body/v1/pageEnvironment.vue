<template>

</template>
<script>
    export default {
        name: "pageEnvironment",
        props:{
            head: {}
        },
        created(){
            this.$store.commit('ENV/SET_TITLE', this.head.title);
            $('title').html(this.$store.getters['ENV/GET_HEAD_TITLE']);
        },
        watch:{
            head(n){
                this.$store.commit('ENV/SET_TITLE', n.title);
                $('title').html(this.$store.getters['ENV/GET_HEAD_TITLE']);
            }
        },
    }
</script>