<template>
    <nav>
        <router-link to="/" class="img logo">
            <img alt="Vue logo" src="../../../assets/logo.png">
        </router-link>
        <ul>
            <li>
                <router-link
                        to="/"
                        :class="$router.currentRoute.name === 'home' ? 'selected' : ''"
                >
                    <span>
                        <i class="fas fa-home"></i></span> Главная
                </router-link>
            </li>
            <li>
                <router-link
                        to="/help"
                        :class="$router.currentRoute.name === 'help' ? 'selected' : ''"
                >
                    <span><i class="fas fa-info-circle"></i></span> Помощь
                </router-link>
            </li>

            <li
                v-for="(v, k) in this.$store.getters['TABLES/GET_SHELLS']"
                :key="k"
            >
                <router-link :to="{ name: 'tables', params: {table: k}}" v-html="v.menu" />
            </li>
        </ul>

    </nav>
</template>

<script>
    export default {
        name: "navComponent"
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
                font-size: 16px;
                line-height: 40px;
                border:none;
                &::v-deep span{width: 30px; display: inline-block; font-size: 24px; color: royalblue};
                color: gray;
            };
            a:hover{
                color: black;
                &::v-deep span{color: black}
            }
            a.selected{
                color: black;
                &::v-deep span{color: black}
            }
            a.selected:hover{
                color: silver;
                &::v-deep span{color: silver}
            }
        };
    }
</style>