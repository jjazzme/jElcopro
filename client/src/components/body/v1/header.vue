<template>
    <header>
        <div
          class="s-h-avatar"
          v-if="user"
        >
            <img :src="`/simg/${user.avatar}`" />
        </div>
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
              v-model="invoice"
            />
        </div>
        <div class="s-h-orders">
            <order-invoice-card
              v-for="(order, ind) in orders"
              v-model="orders[ind]"
              :key="ind"
            />
            <order-invoice-card
              :value="{_type:'order'}"
            />
        </div>
    </header>
</template>

<script>
    import OrderInvoiceCard from "./headerComponents/orderInvoiceCard";
    export default {
        name: "headerComponent",
        components: {OrderInvoiceCard},
        data(){
            return {
                main: '',
                method: '',
                user: null,
            }
        },
        computed:{
            title(){
                return this.$store.getters['ENV/GET_TITLE'];
            },
            invoice(){
                let invoice = this.$store.getters['CARDS/GET_INVOICE'];
                if (!invoice) return {_type: 'invoice'};
                invoice._type = 'invoice';
                invoice._count = 0;
                invoice._sum = 0;
                _.forEach(invoice.documentLines, line=>{
                    invoice._count += line.quantity;
                    invoice._sum += line.amount_with_vat;
                });
                return invoice
            },
            orders(){
                let orders = this.$store.getters['CARDS/GET_ORDERS'];
                _.remove(orders, order=>!order.id)
                //orders.push({});
                _.forEach(orders, order=>{
                    order._type = 'order';
                    order._count = 0;
                    order._sum = 0;
                    _.forEach(order.documentLines, line=>{
                        order._count += line.quantity;
                        order._sum += line.amount_with_vat;
                    });
                });
                return orders;
            }

        },
        created(){
            this.user = this.$store.getters['AUTH/getUser'];
            this.$store.dispatch('CARDS/LOAD_CARDS');
        },
        watch:{
            title:{
                handler: function (n) {
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
                deep: true
            }
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";
    header{
        position: relative;
        .s-h-avatar{
            position: absolute;
            top:10px;
            right: 10px;
            width: 50px;
            height: 50px;
            img{
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
        }
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
        .s-h-title{
            font-family: 'Montserrat', 'Open Sans', sans-serif;
            font-size: 1.75em;
            > span{display: inline-block;}
            > span:first-child{color: white;};
            > span:nth-child(2){color: silver; margin: 0 10px;}
            > span:nth-child(3){color: antiquewhite;};
            position: absolute;
            top: 4px;
            left: 20px;
        }
    }
</style>