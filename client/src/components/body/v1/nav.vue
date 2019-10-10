<template>
    <nav>
        <router-link to="/" class="img logo">
            <img alt="Vue logo" src="../../../assets/logo.png">
        </router-link>
        <ul>
            <li>
                <router-link to="/">
                    <span><i class="fas fa-home"></i></span> Главная
                </router-link>
            </li>
            <li>
                <router-link to="/help">
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
                font-size: 20px;
                line-height: 40px;
                border:none;
                &::v-deep span{width: 30px; display: inline-block;};
            };
        };
    }
</style>