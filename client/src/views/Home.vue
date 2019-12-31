<template>
  <main>
    <header>
      <h1>This is an home page</h1>
    </header>
    <article>

    </article>
    <page-environment
      :head="{title: {main: 'главная'}}"
      :foot="null"
    />
  </main>
</template>
<script>
  export default {
    data() {
      return{
        pagenv:{
          title: 'Помощь'
        },
      }
    },
  }
</script>
