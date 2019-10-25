<template>
    <header>
        <div class="title">
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

<style scoped lang="scss">
    header{
        position: relative;
        .title{
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