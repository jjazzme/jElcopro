<template>
  <article>
    <page-environment
            :head="{title: {main: 'помощь'}}"
    />
    <h1>This is an about page</h1>
  </article>
</template>
<script>
  import Vue from 'vue'

  export default {
    data() {return{
      pagenv:{
        title: 'Помощь'
      },
    }},

    components:{

    },
    methods:{
      test(){
        debugger
        let t = [1,2,3,4]
        _.forEach(t, i=>{
          let h = this;
          console.log(this, i)
        })
        return 12
      },
    },
    created(){

      let t = this.test();
      console.log(t)
      Vue.set(this.pagenv, 'test', 12)
    },
  }
</script>