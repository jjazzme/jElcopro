<template />
<script>
    /**
     *
     */
    export default {
        name: "pageEnvironment",
        props:{
            head: {}
        },
        created(){
            this.$store.commit('ENV/SET_TITLE', this.head.title);
            $('title').html(this.$store.getters['ENV/GET_HEAD_TITLE']);
            /*
            $('*[data-animated=pageEnter]').each(function(){
                $(this).addClass('animated').addClass($(this).attr('data-animate-effect'));
                $(this).on('animationend', function () {
                    $(this).removeClass('animated').removeClass($(this).attr('data-animate-effect'))
                });
            });
*/
        },
        watch:{
            head(n){
                this.$store.commit('ENV/SET_TITLE', n.title);
                $('title').html(this.$store.getters['ENV/GET_HEAD_TITLE']);
            }
        },
    }
</script>