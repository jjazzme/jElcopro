<template>
  <nav
    @mouseleave="leave"
  >
    <div class="opener">
      <fa-icon
        :class="{pin: true, 'pinOff': value.pinOff}"
        icon="thumbtack"
        @click="pinOnOff()"
      />
      <fa-icon
        v-if="!value.barsOpen"
        icon="bars"
        class="bars"
        @click="barsOpenClose(true)"
      />
      <fa-icon
        v-else
        v-show="value.pinOff"
        icon="times"
        class="bars barsOpen"
        @click="barsOpenClose(false)"
      />
    </div>

    <ul>
      <li>
        <router-link
          to="/"
          :class="$route.name === 'home' ? 'selected' : ''"
        >
          <span>главная</span>
          <span><fa-icon icon="home"/></span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/help"
          :class="$route.name === 'help' ? 'selected' : ''"
        >
          <span>помощь</span>
          <span><fa-icon icon="info-circle" /></span>
        </router-link>
      </li>
      <li>
        <router-link
          :to="{name: 'prices', query: route('prices').query, params: route('prices').params}"
          :class="$route.name === 'prices' ? 'selected' : ''"
        >
          <span>Прайс</span>
          <span><fa-icon icon="hand-holding-usd" /></span>
        </router-link>
      </li>

      <li
        v-for="(v, k) in shells"
        v-if="v.menu"
        :key="k"
      >
        <router-link
          :to="{ name: 'tables', params: {type: k}}"
          :class="$route.name === 'tables' && $route.params.table === k ? 'selected' : ''"
        >
          <span v-html="v.name.many"></span>
          <span><fa-icon :icon="[v.faIcon.prefix, v.faIcon.name]"/></span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
  import {ShellsStructure} from "../../../classLib/TableSource";

  export default {
    name: "navComponent",
    data(){
      return{
        shells: (new ShellsStructure()).value,
      }
    },
    props:{
      value: null
    },
    methods:{
      barsOpenClose(val){
        if (val === null || val === undefined) this.value.barsOpen = !this.value.barsOpen;
        else this.value.barsOpen = val;
      },
      leave(){
        if (this.value.barsOpen && this.value.pinOff){
          this.barsOpenClose()
        }
      },
      pinOnOff(){
        this.value.pinOff = !this.value.pinOff;
      },
      route(name){
        const val = this.$store.getters['Env/getRoute'](name);
        return val ?? {params: {}, query: {}};
      },
    },
    create(){
      document.title = this.$store.getters['Env/getTitle']
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .opener {
    margin: 10px 0 40px 0;
    height: 24px;
    position: relative;
    font-size: 24px;
    .pin{
      @media screen and (max-width: @mediaMob){
        display: none;
      }
      cursor: pointer;
      position: absolute;
      opacity: .6;
      right: 12px;
      &.pinOff{
        opacity: .3;
        left: 15px;
      }
    }
    .bars{
      cursor: pointer;
      position: absolute;
      @media screen and (max-width: @mediaMob){
        right: -40px;
        &.barsOpen{right: 12px}
      }
      @media screen and (min-width: calc(@mediaMob + 1px)){
        right: 12px;
      }
      &.barsOpen{opacity: .3}
    }
  }
  ul{
    list-style: none;
    padding-inline-start: 10px;
    li{
      a{
        font-family: 'Montserrat', 'Open Sans', sans-serif;
        display: block;
        font-size: 18px;
        line-height: 36px;
        border:none;
        color: gray;
        min-height: 36px;
        position: relative;

        span:first-child{text-transform: capitalize; margin-left: 5px; display: inline-block; max-width: 130px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; position: absolute;}
        span:last-child{width: 30px; display: inline-block; font-size: 24px; color: royalblue; position: absolute; right: 5px};
      };
      a:hover{
        color: black;
        span:last-child{color: black}
      }
      a.selected{
        color: black;
        span:last-child{color: black}
      }
      a.selected:hover{
        color: silver;
        span:last-child{color: silver}
      }
    };
  }
</style>