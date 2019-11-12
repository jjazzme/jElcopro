<template />
<script>
    /**
     *
     */
    export default {
        name: "pageEnvironment",
        props:{
            head: {},
            foot: null,
        },
        created(){
            this.$store.commit('ENV/SET_TITLE', this.head.title);
            $('title').html(this.$store.getters['ENV/GET_HEAD_TITLE']);

            if (this.foot) this.$store.commit('ENV/SET_FOOTER_COMPONENT', this.foot);
        },
        watch:{
            head(n){
                this.$store.commit('ENV/SET_TITLE', n.title);
                $('title').html(this.$store.getters['ENV/GET_HEAD_TITLE']);
            }
        },
    }
</script>