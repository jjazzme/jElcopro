<template>
    <header>
        <div class="title">
            <span>{{main.toUpperCase()}}</span>
            <span v-if="method"> > </span>
            <span>{{method.replace(/^[а-я a-z]/, c => c.toUpperCase())}}</span>
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
        watch:{
            title:{
                handler: function (n) {
                    if (!n) return;
                    this.$set(this, 'main', n.main ? n.main : '');
                    this.$set(this, 'method', n.method ? n.method : '');
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
            span:first-child{color: white};
            span:nth-child(2){color: silver;}
            span:nth-child(3){color: antiquewhite};
            position: absolute;
            top: 20px;
            left: 20px;
        }
    }
</style>