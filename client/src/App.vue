<template>
  <body>
    <nav-component
      v-if="dataSource.userFormed"
      v-model="navModel"
      :class="{ open: navModel.navIsOpen, pin: !navModel.pinOff }"
    />

    <section
      v-if="dataSource.userFormed"
      :class="{ pinOn: !navModel.pinOff}"
    >
      <header-component
        v-model="headerModel"
      />

      <router-view
        :value="mainModel"
      />

      <footer-component
        v-model="footerModel"
      />
    </section>
    <login-component v-else />

    <editor-cover
      v-if="dataSource && dataSource.editor.component"
      v-model="mainModel"
    />

    <requests-component
      v-model="requests"
    />
  </body>
</template>

<script>

import navComponent from './components/body/nav';
import headerComponent from './components/body/header';
import footerComponent from './components/body/footer';
import LoginComponent from "./components/body/login";
import DataSource from "./classLib/DataSource";
import RequestsComponent from "./components/body/requests";
import Viewport from "./classLib/Viewport";
import EditorCover from "./components/editors/cover";

export default {
  name: 'app',
  components: {
    EditorCover,
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
      //user: null,
      viewport: new Viewport(800, 1800)
    }
  },
  computed:{
    storeUser(){
      return this.$store.getters['User/getUser']
    },
    requests(){ return this.$store.getters['Binder/getRequests'] },
  },
  methods:{
    onResize: _.debounce( function(){
      this.viewport.calculate()
    }, 500),
  },
  created() {
    window.addEventListener("resize", this.onResize);
    _.delay(() => { this.viewport.calculate() }, 500);

    if (!this.dataSource) this.$set(this, 'dataSource', new DataSource(this.$store, this.$route.query.optics, 500));
    this.$store.commit('Binder/setLoaders', this.dataSource.shells.getBinders);
    this.dataSource.loadReferences();
    this.dataSource.loadUser().finally(()=> this.$set(this.dataSource, 'userFormed', true));

    this.$set(this, 'navModel', { pinOff: true, navIsOpen: false, viewport: this.viewport, dataSource: this.dataSource });
    this.$set(this, 'footerModel', { viewport: this.viewport, dataSource: this.dataSource });
    this.$set(this, 'headerModel', { viewport: this.viewport, dataSource: this.dataSource });
    this.$set(this, 'mainModel', { viewport: this.viewport, dataSource: this.dataSource })
  },
  destroyed(){
    window.removeEventListener("resize", this.onResize);
  },
  watch:{
    storeUser(n){
      if (n) {
        this.dataSource.loadUser().finally(()=> this.$set(this.dataSource, 'userFormed', true));
      } else {
        this.$store.commit('Binder/cachesClear');
        this.$set(this.dataSource, 'userFormed', false)
      }

      this.$set(this.dataSource, 'user', n);
    },
    //'$route.query.optics'(n){
    //  this.dataSource.setOptics = n;
    //},
    'navModel.pinOff'(){
      this.onResize();
    },
  },

}
</script>

<style lang="less">
  @import "~@/less/_variables";

  @keyframes spin {
    from {transform:rotate(0deg);}
    to {transform:rotate(360deg);}
  }
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
        position: relative; /////  ???????????????????
        .t-row{
          width: 100%;
          margin-bottom: 2px;
          >*{
            >.t-content{
              padding: 5px;
            }
            background-color: @table-body-bg;
          }
        }
        .t-row.t-linear{
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
          grid-gap: 2px 2px;
          .t-cell{
            .t-content{
              .t-label{
                display: none;
              }
            }
          }
        }
        .t-row:not(.t-linear){
          display: flex;
          margin: 2px 0;
          border-bottom: black 1px dotted;
          flex-direction: row;
          align-items: flex-start;
          flex-wrap: wrap;
          height: auto;
          >*{
            flex: 1 1 auto;
            align-self: stretch;
            margin: 2px;
          }
        }

        //.t-row:has(+div.t-fr-cell){
        //  grid-template-columns: 70px repeat(auto-fit, minmax(70px, 1fr));
        //}

        h1{margin: 10px; text-align: center;}
        background-color: white;
        flex: 1 1 auto;
        min-height: calc(100vh - @headerHeightDaw - @footerHeightDaw);
        max-height: calc(100vh - @headerHeightDaw - @footerHeightDaw);
        @media @mob {
          max-height: calc(var(--vh, 1vh) - @headerHeightMob - @footerHeightMob );
        }
        max-width: 100%;
        overflow: hidden;
        display: flex;
        flex-flow: column nowrap;

        >header {
          padding: 10px;
          background: @articleHeaderBg;
        }
        >article{
          flex: 1 1 auto;
          overflow: auto;
          background: #fff0f0;
          border-radius: 10px;
          height: auto;
          display: flex;
          flex-flow: column nowrap;
          background: @main-article-bg;
        }
        @media @mob {
          >article{
            padding: 5px 10px;
          }
        }
        @media @des {
          >article{
            padding: 5px 20px;
          }
        }
        @media @wid {
          >article{
            padding: 5px 40px;
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
  @media @mob {
    html, body {
      min-height: var(--vh, 1vh);
      max-height: var(--vh, 1vh);
      section{
        max-width: 100%;
        margin-left: 0;
        max-height: var(--vh, 1vh);
        min-height: var(--vh, 1vh);
        overflow: hidden;
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
