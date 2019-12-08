<template>
  <header>
    <div
      class="s-h-avatar"
      v-if="user"
      @click="logout()"
    >
      <img :src="`/simg/base${user.avatar}`" />
    </div>
    <div class="s-h-title">
            <span
              data-animated="pageEnter"
              data-animate-effect="bounceInLeft"
            >{{main.toUpperCase()}}</span>
      <span
        data-animated="pageEnter"
        data-animate-effect="flash"
      ><span v-if="method">></span></span>
      <span
        data-animated="pageEnter"
        data-animate-effect="zoomIn delay-1s"
      >{{method.replace(/^[а-я a-z]/, c => c.toUpperCase())}}</span>
    </div>
  </header>
</template>

<script>
  export default {
    name: "header",
    data(){
      return {
        main: '',
        method: '',
        user: null,
      }
    },
    computed: {
      title() {
        return this.$store.getters['Env/getTitle'];
      },
    },
    methods: {
      logout() {
        this.$store.dispatch('Auth/logout')
      },
    },
    created(){
      this.user = this.$store.getters['Auth/getUser'];
    },
    watch:{
      title:{
        handler: function (n) {
          if (!n) return;
          this.$set(this, 'main', n.main ? n.main : '');
          this.$set(this, 'method', n.method ? n.method : '');

          $('*[data-animated=pageEnter]').each(function(){
            $(this).addClass('animated').addClass($(this).attr('data-animate-effect'));
            $(this).on('animationend', function () {
              $(this).removeClass('animated').removeClass($(this).attr('data-animate-effect'))
            });
          });
        },
        deep: true
      }
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  header{
    position: relative;
    .s-h-avatar{
      position: absolute;
      top:10px;
      right: 10px;
      width: 50px;
      height: 50px;
      cursor: pointer;
      img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    .s-h-invoice{
      position: absolute;
      top: 55px;
      left: 30px;
    }
    .s-h-orders{
      display: flex;
      position: absolute;
      top: 55px;
      left: 330px;
      max-width: 700px;
      height: 140px;
      overflow: auto;
    }
    .s-h-title{
      font-family: 'Montserrat', 'Open Sans', sans-serif;
      font-size: 1.75em;
      > span{display: inline-block;}
      > span:first-child{color: white;};
      > span:nth-child(2){color: silver; margin: 0 10px;}
      > span:nth-child(3){color: antiquewhite;};
      position: absolute;
      top: 4px;
      left: 20px;
    }
  }
</style>