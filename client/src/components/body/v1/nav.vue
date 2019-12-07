<template>
    <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
    <nav>
        <router-link to="/" class="img logo">
            <img alt="Vue logo" src="../../../assets/logo.png">
        </router-link>
        <ul>
            <li>
                <router-link
                        to="/"
                        :class="$route.name === 'home' ? 'selected' : ''"
                >
                    <span><fa-icon icon="home"/></span>
                    <span>главная</span>
                </router-link>
            </li>
            <li>
                <router-link
                        to="/help"
                        :class="$route.name === 'help' ? 'selected' : ''"
                >
                    <span><fa-icon icon="info-circle" /></span>
                    <span>помощь</span>
                </router-link>
            </li>
            <li>
                <router-link
                        :to="{name: 'prices', query: route('prices').query, params: route('prices').params}"
                        :class="$route.name === 'prices' ? 'selected' : ''"
                >
                    <span><fa-icon icon="hand-holding-usd" /></span>
                    <span>Прайс</span>
                </router-link>
            </li>

            <li
                v-for="(v, k) in this.$store.getters['TABLES/GET_SHELLS']"
                v-if="v.menu"
                :key="k"
            >
                <router-link
                        :to="{ name: 'tables', params: {type: k}}"
                        :class="$route.name === 'tables' && $route.params.table === k ? 'selected' : ''"
                >
                    <span><fa-icon :icon="[v.faIcon.prefix, v.faIcon.name]"/></span>
                    <span v-html="v.name.many"></span>
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<script>

    export default {
        name: "navComponent",
        data(){
            return{
                Test: false,
            }
        },
        methods:{
            test(){this.Test = true;console.log(this.Test);},
            route(name){
                const val = this.$store.getters['ENV/GET_ROUTE'](name);
                return val ?? {params: {}, query: {}};
            }
        },
        computed: {

        },
        create(){
            document.title = this.$store.getters['ENV/GET_TITLE']
        },
        watch:{

        },
    }
</script>

<!--suppress CssInvalidPseudoSelector -->
<style scoped lang="scss">
    ul{
        list-style: none;
        padding-inline-start: 10px;
        li{
            a{
                font-family: 'Montserrat', 'Open Sans', sans-serif;
                display: block;
                font-size: 18px;
                line-height: 36px;
                border:none;
                span:first-child{width: 30px; display: inline-block; font-size: 24px; color: royalblue};
                span:last-child{text-transform: capitalize; margin-left: 5px; display: inline-block; max-width: 130px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; position: absolute;}
                color: gray;
                min-height: 36px;
            };
            a:hover{
                color: black;
                span:first-child{color: black}
            }
            a.selected{
                color: black;
                span:first-child{color: black}
            }
            a.selected:hover{
                color: silver;
                span:first-child{color: silver}
            }
        };
    }
</style>