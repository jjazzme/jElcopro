<template>
  <div class="p-l-body">
    <div class="p-l-form">
      <b-form-input
        v-model="username"
        placeholder="Пользователь"
        required
      />
      <b-form-input
        v-model="password"
        type="password"
        placeholder="Пароль"
        required
      />

      <b-button
        type="button"
        @click="loginIn()"
        variant="primary"
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
      }
    },
    methods:{
      loginIn(){
        this.$store.dispatch('Auth/login', { username: this.username, password: this.password})
        .then(ans => {
          this.password = null;
          this.error = '';
        })
        .catch(err => {
          this.error = 'Ошибка авторизации';
        })
      },
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

  .p-l-body{
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .p-l-form{
      flex: 0 1 auto;
      border: @card-border;
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