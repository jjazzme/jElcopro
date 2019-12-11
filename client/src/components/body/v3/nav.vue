<template>
  <nav
    @mouseleave="leave"
    v-if="value"
  >
    <div class="opener">
      <fa-icon
        :class="{pin: true, 'pinOff': value.pinOff}"
        icon="thumbtack"
        @click="pinOnOff()"
      />
      <user-component
        v-if="value.viewport.width <= value.viewport.mobileWidthPoint"
      />
      <fa-icon
        v-if="!value.navIsOpen"
        icon="bars"
        class="bars"
        @click="navCollapse(false)"
      />
      <fa-icon
        v-else
        v-show="value.pinOff"
        icon="times"
        class="bars barsOpen"
        @click="navCollapse(true)"
      />
    </div>

    <ul>
      <li>
        <router-link
          to="/"
          :class="$route.name === 'home' ? 'selected' : ''"
          @click.native="navClick()"
        >
          <span>главная</span>
          <span><fa-icon icon="home"/></span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/help"
          :class="$route.name === 'help' ? 'selected' : ''"
          @click.native="navClick()"
        >
          <span>помощь</span>
          <span><fa-icon icon="info-circle" /></span>
        </router-link>
      </li>
      <li>
        <router-link
          :to="{name: 'prices', query: route('prices').query, params: route('prices').params}"
          :class="$route.name === 'prices' ? 'selected' : ''"
          @click.native="navClick()"
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
          @click.native="navClick()"
        >
          <span v-html="v.name.many"></span>
          <span><fa-icon :icon="[v.faIcon.prefix, v.faIcon.name]"/></span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
  import UserComponent from "./headerComponents/user";

  export default {
    name: "navComponent",
    components: {UserComponent},
    data(){
      return{
        shells: null,
      }
    },
    props:{
      value: null
    },
    methods:{
      navCollapse(val){
        if (val === null || val === undefined) this.value.navIsOpen = !this.value.navIsOpen;
        else this.value.navIsOpen = !val;
      },
      leave(){
        if (this.value.navIsOpen && this.value.pinOff){
          this.navCollapse()
        }
      },
      navClick(){
        if(this.value.pinOff && this.value.navIsOpen) this.navCollapse(true);
        window.scrollTo(0, 0);
      },
      pinOnOff(){
        this.value.pinOff = !this.value.pinOff;
      },
      route(name){
        const val = this.$store.getters['Env/getRoute'](name);
        return val ?? {params: {}, query: {}};
      },
    },
    created(){
      this.$set(this, 'shells', this.value.dataSource.shells.value)
    }
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
        font-size: 14px;
      }
    }
    .bars{
      cursor: pointer;
      position: absolute;
      @media screen and (max-width: @mediaMob){
        right: -40px;
        &.barsOpen{left: 12px}
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