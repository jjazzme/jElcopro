<template>
  <div class="text-center">
    <b-button
      v-for="(p,i) in pagesConstructor"
      :key="i"
      :disabled="p.selected"
      @click="select(p.page)"
      variant="link"
      class="p-button"
    >{{p.view}}</b-button>
  </div>
</template>

<script>
  //import Vue from 'vue'

  export default {
    name: "Paginator",
    props: {
      value: null
    },
    computed:{
      pagesConstructor(){
        let ret=[];
        const source = this.value?.loadProcessor?.page;
        if (source){
          const pages = source.pages;
          const page = source.page;

          const before = page - 1;
          const after = pages - page;
          let b, a, bb, aa;


          if (before<1) {b = 0}
          else if (before<2) {b = 1}
          else if (before<3) {b = 2}
          else if (before<10) {b = 3}
          else {b = 4}

          if (after<1) { a = 0}
          else if (after<2) {a = 1}
          else if (after<3) {a = 2}
          else if (after<10) {a = 3}
          else { a = 4}

          if (a+b<8 && a+b<pages-1) {
            let emergency_exit = false;
            do {
              if (before>b) {b++}
              else if (after>a) {a++}
              else {emergency_exit=true}
            } while (a+b<8 && a+b<pages-1 && !emergency_exit)
          }

          if(a>b){
            bb=a-b;
            aa=0
          } else{
            aa = b-a;
            bb=0
          }

          let id = 0;
          for(let i=0;i<bb;i++){
            ret.push({id:id, page:page, view:'', selected:true});
            id++
          }

          for (let i = 0; i<=b; i++){
            if (i===b) {ret.push({id:id, page:page, view:page, selected:true})}
            else if (i===0) {ret.push({id:id, page:1, view:'<<', selected:false})}
            else if (i===b-1) {ret.push({id:id, page:page-1, view:'<', selected:false})}
            else {
              const pg = Math.round(parseFloat(1+i*(before-1)/(b-1)));
              ret.push({id:id, page:pg, view:pg, selected:false});
            }
            id++
          }

          for (let i = 0; i<a; i++){
            if (i===a-1) {ret.push({id:id, page:pages, view:'>>', selected:false})}
            else if (i===0) {ret.push({id:id, page:page+1, view:'>', selected:false})}
            else {
              const pg = Math.round(parseFloat(page+1+i*(after-1)/(a-1)));
              ret.push({id:id, page:pg, view:pg, selected:false});
            }
            id++
          }
          for(let i=0;i<aa;i++){
            ret.push({id:id, page:page, view:'', selected:true});
            id++
          }
        }
        return ret;
      }
    },
    methods:{
      select(p){
        this.$set(this.value.optics.value, 'page', p);
      },
    },
  }
</script>

<style scoped lang="less">
  &div{min-height: 32px;}
  .p-button {padding-left: 10px; padding-right: 10px; min-width: 50px; font-size: 12px;}
</style>