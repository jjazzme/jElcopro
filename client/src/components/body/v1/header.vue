<template>
    <header>
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
            <b-link
              :to="{name:'tables', params:{table:'Invoice'}}"
              v-if="!invoice"
            >
                Добавить счёт
            </b-link>
            <div
              v-else
            >
                <div class="h-i-close" @click="closeInvoice()">x</div>
                <div class="h-i-topic">Счёт №{{invoice.number}} от {{Intl.DateTimeFormat('ru-RU').format(new Date(invoice.date))}}</div>
                <div class="h-i-sum">{{invoice._sum}}₽</div>
                <div class="h-i-lines">Строк: {{invoice.documentLines.length}} | Товаров: {{invoice._count}}</div>
                <div class="h-i-buyer" :title="invoice.buyerable.party.name">{{invoice.buyerable.party.name}}</div>
            </div>
        </div>
    </header>
</template>

<script>
    export default {
        name: "headerComponent",
        data(){
            return {
                main: '',
                method: '',
            }
        },
        computed:{
            title(){
                return this.$store.getters['ENV/GET_TITLE'];
            },
            invoice(){
                let invoice = this.$store.getters['CARDS/GET_INVOICE'];
                if (!invoice) return null;
                invoice._count = 0;
                invoice._sum = 0;
                _.forEach(invoice.documentLines, line=>{
                    invoice._count += line.quantity;
                    invoice._sum += line.amount_with_vat;
                });
                return invoice
            }

        },
        methods:{
            closeInvoice(){
                this.$store.commit('CARDS/SET_INVOICE', null)
            }
        },
        created(){

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
        .s-h-invoice{
            .h-i-close{
                color: red;
                cursor: pointer;
                font-weight: 600;
                position: absolute;
                top:0;
                right: 5px;
            }
            .h-i-topic{
                text-align: center;
                width: 100%;
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
            }
            .h-i-sum{
                font-size: 20px;
                font-weight: 600;
                margin-top: 10px;
            }
            .h-i-lines{
                font-size: 12px;
                margin-top: 10px;
            }
            .h-i-buyer{
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                font-size: 12px;
            }

            position: relative;
            width: 230px;
            height: 120px;
            background-color: @table-body-bg;
            top: 55px;
            left: 30px;
            padding: 10px;
            border-radius: 10px;
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