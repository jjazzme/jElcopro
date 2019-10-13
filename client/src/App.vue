<template>
  <body>
    <nav-component />

    <section>
      <header-component />

      <main>
        <router-view />
      </main>

      <footer-component />
    </section>
  </body>
</template>

<script>

import navComponent from './components/body/v1/nav';
import headerComponent from './components/body/v1/header';
import footerComponent from './components/body/v1/footer';
export default {
  name: 'app',
  components: {
    navComponent,
    headerComponent,
    footerComponent,
  },
  created(){
    //let t= 12;
  },

}
</script>

<style lang="scss" scoped>
  p{
    b{color:black;}
  }
</style>
