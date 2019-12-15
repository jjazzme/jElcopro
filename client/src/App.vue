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

      <footer-component
        v-model="footerModel"
      />
    </section>
    <login-component v-else />
    <requests-component
      v-model="requests"
    />
  </body>
</template>

<script>

import navComponent from './components/body/v3/nav';
import headerComponent from './components/body/v3/header';
import footerComponent from './components/body/v3/footer';
import LoginComponent from "./components/body/v3/login";
import DataSource from "./classLib/DataSource";
import RequestsComponent from "./components/body/v3/requests";

export default {
  name: 'app',
  components: {
    RequestsComponent,
    LoginComponent,
    navComponent,
    headerComponent,
    footerComponent,
  },
  data(){
    return{
      dataSource: null,
      footerModel: null,
      headerModel: null,
      mainModel: null,
      navModel: null,
      viewport: {
        bigWidthPoint: 1600,
        height: 0,
        mainWidth: 0,
        mainHeight: 0,
        type: (width) => {
          if (width < 801) return 'mob';
          else if (width < 1801) return 'des';
          else return 'wid'
        },
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
    requests(){ return this.$store.getters['Binder/getRequests'] }
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
    window.addEventListener("resize", this.onWindowResize);
    this.onWindowResize();

    this.$set(this, 'dataSource', new DataSource(this.$store));
    this.$store.dispatch('Auth/autoLogin');

    this.$set(this, 'navModel', { pinOff: true, navIsOpen: false, viewport: this.viewport, dataSource: this.dataSource });
    this.$set(this, 'footerModel', { viewport: this.viewport, dataSource: this.dataSource });
    this.$set(this, 'headerModel', { viewport: this.viewport, dataSource: this.dataSource });

    this.$set(this, 'mainModel', { viewport: this.viewport, dataSource: this.dataSource })
  },
  destroyed(){
    window.removeEventListener("resize", this.onWindowResize);
  },
  watch:{
    user(n){
      this.$set(this.dataSource, 'user', n);
    }
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
      @media @daw {
        left: -140px;
        &.open{left: 0}
        min-width: 200px;
        max-width: 200px;
      }
      @media @mob{
        right: -90%;
        &.open{right: 0}
        min-width: 90%;
        max-width: 90%;
      }

      position: fixed;
      padding: 5px;
      background: @nav-bg;
      top: 0;
      z-index: 200;
      height: 100vh;
      @media @daw {border-right: dotted 1px gray};
      @media @mob {border-left: dotted 1px gray}
    }
    >section{
      display: flex;
      flex-direction: column;
      align-content: space-between;
      flex: 1 1 auto;
      max-width: calc(100% - 60px);
      margin-left: 60px;
      min-height: 600px;
      max-height: 100vh;
      @media @mob {
        max-width: 100%;
        margin-left: 0;
      }
      &.pinOn{
        max-width: calc(100% - 200px);
        margin-left: 200px;
      }

      >header{
        flex: 1 1 auto;
        min-height: @headerHeightDaw;
        max-height: @headerHeightDaw;
        @media @mob {
          min-height: @headerHeightMob;
          max-height: @headerHeightMob;
        }
        background: @header-bg;
      }
      >main{
        flex: 1 1 auto;
        min-height: 300px;
        max-height: calc(100vh - @headerHeightDaw - @footerHeightDaw);
        @media @mob {
          max-height: calc(100vh - @headerHeightMob - @footerHeightMob);
        }
        max-width: 100%;
        overflow: auto;
        >article{
          border-radius: 10px;
          min-height: 100%;
          max-height: 100%;
          height: 100%;
          display: flex;
          flex-flow: column nowrap;
          background: @main-article-bg;
        }
        @media @mob {
          >article{
            margin: 0 5px;
            padding: 5px;
          }
        }
        @media @des {
          >article{
            margin: 0 10px;
            padding: 10px;
          }
        }
        @media @wid {
          >article{
            margin: 0 20px;
            padding: 20px;
          }
        }
      }
      >footer{
        flex: 1 1 auto;
        min-height: @footerHeightDaw;
        max-height: @footerHeightDaw;
        @media @mob {
          min-height: @footerHeightMob;
          max-height: @footerHeightMob;
        }
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
