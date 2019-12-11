<template>
  <div
    class="s-h-avatar"
    v-if="user"
    @click="logout()"
  >
    <img :src="`/simg/base${user.avatar}`" />
  </div>
</template>

<script>
  export default {
    name: "userComponent",
    data(){
      return{
        user: null,
      }
    },
    methods: {
      logout() {
        this.$store.dispatch('Auth/logout')
      },
    },
    created(){
      this.user = this.$store.getters['Auth/getUser'];
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .s-h-avatar{
    position: absolute;
    width: 50px;
    height: 50px;
    cursor: pointer;

    @media screen and (max-width: @mediaMob){
      top:-12px;
      right: -5px;
      transform: scale(0.5);
    }
    @media screen and (min-width: calc(@mediaMob + 1px)){
      top:10px;
      right: 10px;
    }
    img{
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
</style>