<template>
  <article>
    <page-environment
            :head="{title: {main: 'помощь'}}"
    />
    <h1>This is an about page</h1>
  </article>
</template>
<script>
  export default {
    data() {return{
      pagenv:{
        title: 'Помощь'
      },
    }},

    components:{

    },
    methods:{
    },
    created(){

      //let t = this.pagenv.meaning();
    },
  }
</script>