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
                <div
                  class="s-h-close"
                  @click="closeInvoice()"
                >x</div>
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
                return this.$store.getters['CARDS/GET_INVOICE']
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
            .s-h-close{
                color: red;
                cursor: pointer;
                font-weight: 600;
                position: absolute;
                top:0;
                right: 5px;
            }
            position: relative;
            width: 200px;
            height: 100px;
            background-color: @table-body-bg;
            top: 70px;
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
            top: 20px;
            left: 20px;
        }
    }
</style>