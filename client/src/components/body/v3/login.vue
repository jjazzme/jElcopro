<template>
 <div class="p-l-body">
    <div :class="{ 'p-l-form': true, 'p-l-transp': disabled}">
      <div class="p-l-logo">
        <img
          alt="ElcoPRO"
          src="/img/logo_.png"
        />
      </div>

      <b-form-input
        v-model="username"
        placeholder="Пользователь"
        required
        id="username"
        ref="username"
        @keydown="keydown"
        :disabled="disabled"
      />
      <b-form-input
        v-model="password"
        type="password"
        id="password"
        ref="password"
        placeholder="Пароль"
        @keydown="keydown"
        required
        :disabled="disabled"
      />

      <b-button
        type="button"
        @click="login()"
        variant="primary"
        :disabled="disabled"
      >Войти</b-button>
      <div class="p-l-error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "login",
    data(){
      return {
        username: null,
        password: null,
        error: '',
        disabled: true,
      }
    },
    methods:{
      keydown(e){
        if (e.code === 'Enter') {
          if(e.target.id === 'username') this.$refs.password.$el.focus();
          else if (e.target.id === 'password') this.login();
        }
      },
      login(){
        this.$store.dispatch('Auth/login', { username: this.username, password: this.password})
        .then(ans => {
          this.password = null;
          this.error = '';
        })
        .catch(err => {
          this.error = 'Ошибка авторизации';
        })
      },
    },
    mounted() {
      _.delay(()=>{
        this.disabled = false;
        if(this.$refs.username) this.$refs.username.$el.focus();
      }, 1000)
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .p-l-transp{opacity: 0.2}

  .p-l-body{
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .p-l-logo{
      position: relative;
      text-align: center;
      >img{
        position: absolute;
        top: -100px;
        left: 0;
      }
    }
    .p-l-form{
      z-index: 100;
      flex: 0 1 auto;
      @media @daw {
        border: @card-border;
      }
      border-radius: 20px;
      padding: 50px;
      input{
        width: 300px;
        font-size: 24px;
        margin-bottom: 20px;
        color: gray;
      }
      .p-l-error{
        height: 40px;
        color: red;
        margin-top: 20px;
      }
    }
  }
</style>