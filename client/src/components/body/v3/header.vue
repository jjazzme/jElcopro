<template>
  <header v-if="value">
    <user-component
      v-if="value.viewport.type > value.viewport.mobileWidthPoint"
    />
    <router-link to="/" class="img s-h-logo">
      <img alt="Vue logo" src="../../../assets/logo.png">
    </router-link>

    <div class="s-h-title">
            <span
              data-animated="pageEnter"
              data-animate-effect="bounceInLeft"
            >{{main.toUpperCase()}}</span>
      <span
        data-animated="pageEnter"
        data-animate-effect="flash"
      ><span v-if="method">></span></span>
      <span
        data-animated="pageEnter"
        data-animate-effect="zoomIn delay-1s"
      >{{method.replace(/^[а-я a-z]/, c => c.toUpperCase())}}</span>
    </div>
    <div class="s-h-invoice">
      <order-invoice-card
        v-model="value"
        type="Invoice"
        :id="value.dataSource.user.cards.invoice"
      />
    </div>
    <div class="s-h-orders">
      <order-invoice-card
        v-for="id in value.dataSource.user.cards.orders"
        v-model="value"
        type="Order"
        :id="id"
        :key="id"
      />
      <order-invoice-card
        type="Order"
        :id="null"
        v-model="value"
      />
    </div>
  </header>
</template>

<script>
  import OrderInvoiceCard from "./headerComponents/orderInvoiceCard";
  import UserComponent from "./headerComponents/user";
  export default {
    name: "headerComponent",
    components: { UserComponent, OrderInvoiceCard },
    data(){
      return {
        main: '',
        method: '',
      }
    },
    props: {
      value: null,
    },
    computed: {
      title() {
        return this.$store.getters['Env/getTitle'];
      },
    },
    methods: {
      setTitle() {
        const n = this.title;
        if (!n) return;
        this.$set(this, 'main', n.main ? n.main : '');
        this.$set(this, 'method', n.method ? n.method : '');

        $('*[data-animated=pageEnter]').each(function(){
          $(this).addClass('animated').addClass($(this).attr('data-animate-effect'));
          $(this).on('animationend', function () {
            $(this).removeClass('animated').removeClass($(this).attr('data-animate-effect'))
          });
        });
      },
    },
    created(){
      this.setTitle();
    },
    watch:{
      title:{
        handler: function () {
          this.setTitle();
        },
        deep: true
      }
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  header{
    position: relative;

    .s-h-invoice{
      position: absolute;
      top: 55px;
      left: 30px;
    }
    .s-h-orders{
      display: flex;
      position: absolute;
      top: 55px;
      left: 330px;
      max-width: 700px;
      height: 140px;
      overflow: auto;
    }
    .s-h-logo{
      position: absolute;;
      @media @mob {
        left: -25px;
        top: 5px;
        text-align: right;
        //transform: scale(0.5);
        img{
          width: 75%;
        }
      }
      @media @daw {
        top: 5px;
        left: 20px;
      }
    }
    .s-h-title{
      font-family: 'Montserrat', 'Open Sans', sans-serif;
      position: absolute;

      @media @mob {
        font-size: 1.25em;
        bottom: 5px;
        left: 10px;
      }
      @media @daw {
        font-size: 1.75em;
        top: 4px;
        left: 180px;
      }
      > span{display: inline-block;}
      > span:first-child{color: white;};
      > span:nth-child(2){color: silver; margin: 0 10px;}
      > span:nth-child(3){color: antiquewhite;};
    }
  }
</style>