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
                    <i class="fas fa-home"></i><span>главная</span>
                </router-link>
            </li>
            <li>
                <router-link
                        to="/help"
                        :class="$route.name === 'help' ? 'selected' : ''"
                >
                    <i class="fas fa-info-circle"></i><span>помощь</span>
                </router-link>
            </li>

            <li
                v-for="(v, k) in this.$store.getters['TABLES/GET_SHELLS']"
                v-if="v.menu"
                :key="k"
            >
                <router-link
                        :to="{ name: 'tables', params: {table: k}}"
                        :class="$route.name === 'tables' && $route.params.table === k ? 'selected' : ''"
                >
                    <i :class="v.iClass"></i><span v-html="v.name.many"></span>
                </router-link>
            </li>
        </ul>

    </nav>
</template>

<script>
    export default {
        name: "navComponent",
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
                font-size: 18px;
                line-height: 36px;
                border:none;
                i{width: 30px; display: inline-block; font-size: 24px; color: royalblue};
                span{text-transform: capitalize; margin-left: 5px; display: inline-block; max-width: 130px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; position: absolute;}
                color: gray;
            };
            a:hover{
                color: black;
                i{color: black}
            }
            a.selected{
                color: black;
                i{color: black}
            }
            a.selected:hover{
                color: silver;
                i{color: silver}
            }
        };
    }
</style>