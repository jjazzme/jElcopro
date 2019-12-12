<template />
<script>
    /**
     *
     */
    import Footer from "../../../classLib/Footer";
    export default {
      name: "pageEnvironment",
      props:{
        head: {},
        foot: null,
      },
      created(){
        this.$store.commit('Env/setTitle', this.head.title);
        $('title').html(this.$store.getters['Env/getHeadTitle']);

        if (this.foot) this.$store.commit('Env/setFooterComponent', this.foot);
        else this.$store.commit('Env/setFooterComponent', new Footer({name: 'footerStandard', vmodel: null}));
      },
      watch:{
        head(n){
          this.$store.commit('Env/setTitle', n.title);
          $('title').html(this.$store.getters['Env/getHeadTitle']);
        }
      },
    }
</script>