<template>
  <body>
    <nav-component v-if="user" />

    <section v-if="user">
      <header-component />

      <main>
        <router-view />
      </main>

      <footer-component />
    </section>
    <login-component v-else />
  </body>
</template>

<script>

import navComponent from './components/body/v2/nav';
import headerComponent from './components/body/v1/header';
import footerComponent from './components/body/v1/footer';
import LoginComponent from "./components/body/v1/login";
export default {
  name: 'app',
  components: {
    LoginComponent,
    navComponent,
    headerComponent,
    footerComponent,
  },

  computed:{
    user(){
      //return this.$store.getters['AUTH/getUser']
    }
  },
  created() {
    //this.$store.dispatch('AUTH/autoLogin')
  }

}
</script>

<style lang="less">
  @import "~@/less/_variables";
  body{
    opacity: 1;
    background: @body-bg;
    >nav{
      background: @nav-bg;
    }
    >section{
      >header{
        background: @header-bg;
      }
      >main{
        >article{
          background: @main-article-bg;
        }
      }
      >footer{
        background: @footer-bg;
        color: @footer-text;
        a{
          color: @footer-text;
          opacity: 0.8;
          border: none;
        }
        a:hover{opacity: 1; color: @footer-text;}
      }
    }
  }
  h1 {font-size: 1.75em}
  h1, h2, h3, h4, h5, h6{font-family: 'Montserrat', 'Open Sans', sans-serif}
  p{text-indent: 12px; line-height: 30px; margin: 10px 0;}
  a{
    color: @a-color;
    text-decoration: none;
    border-bottom: solid 3px lightseagreen;
    transition: 0.5s;
  }
  a:hover{color: @a-hover-color; border-bottom: solid 1px lightseagreen; text-decoration: none;}
  a.logo{display: block;margin-bottom: 40px; text-align: center}
  li>a:hover{border-bottom: none;}
  a.img, a.img:hover{border-bottom: none;}

</style>
