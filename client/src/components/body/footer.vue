<template>
  <footer>
    <component
      v-bind:is="component.component"
      v-model="component.vmodel"
      :model="value"
    ></component>
    <div class="b-f-bottom">
      <a href="http://electronika.su" class="b-f-copyright">© Elcopro, 2019</a>
    </div>
  </footer>
</template>

<script>
  export default {
    name: "footerComponent",
    props: {
      value: null,
    },
    computed: {
      component(){
        let component = this.$store.getters['Env/getFooterComponent'];
        //component.import = () => import(`./footerComponents/${component.name}`);
        return component;
      }
    },
    mounted() {
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  footer{
    position: relative;
    .b-f-bottom{
      @media @mob{
        display: none;
      }
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      text-align: right;
    }
    .b-f-copyright{
      font-size: 0.75em;
      border: none;
      margin-right: 3px;
    }
  }
</style>