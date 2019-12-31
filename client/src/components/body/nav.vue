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
        v-if="value.viewport.type === value.viewport.types.mobile"
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

      <li style="order: 10">
        <router-link
          to="/"
          :class="$route.name === 'home' ? 'selected' : ''"
          @click.native="navClick()"
        >
          <span>главная</span>
          <span><fa-icon icon="home"/></span>
        </router-link>
      </li>

      <li style="order: 20">
        <router-link
          to="/help"
          :class="$route.name === 'help' ? 'selected' : ''"
          @click.native="navClick()"
        >
          <span>помощь</span>
          <span><fa-icon icon="info-circle" /></span>
        </router-link>
      </li>

      <li
        v-for="(v, k) in value.dataSource.shells.template"
        v-if="v.menu"
        :key="k"
        :style="`order: ${v.menu}`"
      >
        <router-link
          :to="{ name: 'tables', params: {type: k}, query: { optics: value.dataSource.getQueryOpticsByType(k) } }"
          :class="$route.name === 'tables' && $route.params.type === k ? 'selected' : ''"
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
      @media @mob {
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
      @media @mob {
        &:not(.barsOpen){left: -40px};
        &.barsOpen{right: 12px}
      }
      @media @daw {
        right: 12px;
      }
      &.barsOpen{opacity: .3}
    }
  }
  ul{
    list-style: none;
    display: flex;
    flex-direction: column;
    padding-inline-start: 10px;
    li{
      a{
        font-family: 'Montserrat', 'Open Sans', sans-serif;
        display: flex;
        font-size: 18px;
        line-height: 36px;
        border:none;
        color: gray;
        min-height: 36px;
        position: relative;
        @media @mob {padding-left: 10%};

        span:first-child{margin-left: 5px; display: inline-block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;}
        span:last-child{width: 30px; display: inline-block; font-size: 24px; color: royalblue;};
        @media @mob{
          span:first-child{width: auto; order: 2; padding-left: 10px; text-transform: uppercase;}
          span:last-child{order: 1;}
        }
        @media @daw{
          span:first-child{max-width: 130px; position: absolute; text-transform: capitalize;}
          span:last-child{position: absolute; right: 5px;}
        }
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