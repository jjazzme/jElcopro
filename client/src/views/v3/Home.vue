<template>
  <article>
    <page-environment
      :head="{title: {main: 'главная'}}"
    />
    <h1>This is an home page</h1>
  </article>
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
