<template>
  <body>
    <nav-component
      v-if="user"
      v-model="navModel"
      :class="{ open: navModel.navIsOpen, pin: !navModel.pinOff }"
    />

    <section
      v-if="user"
      :class="{ pinOn: !navModel.pinOff}"
    >
      <header-component
        v-model="headerModel"
      />

      <main>
        <router-view
          :model="mainModel"
        />
      </main>

      <footer-component />
    </section>
    <login-component v-else />
  </body>
</template>

<script>

import navComponent from './components/body/v3/nav';
import headerComponent from './components/body/v3/header';
import footerComponent from './components/body/v3/footer';
import LoginComponent from "./components/body/v3/login";
import DataSource from "./classLib/DataSource";

export default {
  name: 'app',
  components: {
    LoginComponent,
    navComponent,
    headerComponent,
    footerComponent,
  },
  data(){
    return{
      dataSource: null,
      headerModel: null,
      mainModel: null,
      navModel: null,
      viewport: {
        bigWidthPoint: 1600,
        height: 0,
        mainWidth: 0,
        mainHeight: 0,
        mobileWidthPoint: 600,
        screenHeight: 0,
        screenWidth: 0,
        width: 0,
      },
    }
  },
  computed:{
    user(){
      return this.$store.getters['Auth/getUser']
    },
  },
  methods:{
    onWindowResize(){
      this.$set(this.viewport, 'height', Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
      this.$set(this.viewport, 'width', Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
      this.$set(this.viewport, 'screenHeight', window.screen.availHeight);
      this.$set(this.viewport, 'screenWidth', window.screen.availWidth);
      this.$set(this.viewport, 'mainWidth', $('body > section > main').clientWidth);
      this.$set(this.viewport, 'mainHeight', $('body > section > main').clientHeight);

      return true;
    }
  },
  created() {
    this.$store.dispatch('Auth/autoLogin');
    window.addEventListener("resize", this.onWindowResize);
    this.onWindowResize();

    this.$set(this, 'dataSource', new DataSource(this.$store));

    this.$set(this, 'navModel', { pinOff: true, navIsOpen: false, viewport: this.viewport, dataSource: this.dataSource });
    this.$set(this, 'headerModel', { viewport: this.viewport, dataSource: this.dataSource });

    this.$set(this, 'mainModel', { viewport: this.viewport, dataSource: this.dataSource })
  },
  destroyed(){
    window.removeEventListener("resize", this.onWindowResize);
  },
  watch:{

  },

}
</script>

<style lang="less">
  @import "~@/less/_variables";
  body{
    opacity: 1;
    background: @body-bg;
    position: relative;
    >nav{
      transition-duration: 0.5s;
      left: -140px;
      @media screen and (max-width: @mediaMob){left: -200px;}

      &.open{left: 0}

      position: fixed;
      padding: 5px;
      min-width: 200px;
      max-width: 200px;
      background: @nav-bg;
      top: 0;
      z-index: 200;
      height: 100vh;
      border-right: dotted 1px gray;
    }
    >section{
      display: flex;
      flex-direction: column;
      align-content: space-between;
      flex: 1 1 auto;
      max-width: calc(100% - 60px);
      margin-left: 60px;
      @media screen and (max-width: @mediaMob){
        max-width: 100%;
        margin-left: 0;
      }
      &.pinOn{
        max-width: calc(100% - 200px);
        margin-left: 200px;
      }

      >header{
        flex: 1 1 auto;
        min-height: 200px;
        max-height: 200px;
        background: @header-bg;
      }
      >main{
        flex: 1 1 auto;
        min-height: 100ch;
        >article{
          margin: 0 20px;
          padding: 20px;
          border-radius: 10px;
          min-height: 100%;
          max-height: 100%;
          height: 100%;
          display: flex;
          flex-flow: column nowrap;
          background: @main-article-bg;
        }
      }
      >footer{
        flex: 1 1 auto;
        min-height: 100px;
        max-height: 100px;
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
  li>a:hover{border-bottom: none;}
  a.img, a.img:hover{border-bottom: none;}

</style>
