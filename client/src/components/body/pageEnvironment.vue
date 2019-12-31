<template />
<script>
    /**
     *
     */
    import Footer from "../../classLib/Footer";
    import footerStandard from "./footerComponents/footerStandard"
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
        else this.$store.commit('Env/setFooterComponent', new Footer({component: footerStandard, vmodel: null}));
      },
      watch:{
        head(n){
          this.$store.commit('Env/setTitle', n.title);
          $('title').html(this.$store.getters['Env/getHeadTitle']);
        },
        foot(n) {
          if (n) this.$store.commit('Env/setFooterComponent', n);
          else this.$store.commit('Env/setFooterComponent', new Footer({component: footerStandard, vmodel: null}));
        }
      },
    }
</script>