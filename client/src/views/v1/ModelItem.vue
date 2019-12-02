<template>
    <article>
        <page-environment
                :head="{title: {main: 'карточка', method: alias }}"
        />
        <div v-if="document">
            <h1>{{header}} </h1>
            <div class="p-l-card">
                <div class="p-l-row"
                  v-for="(val, key) in shell.initial"
                  v-if="val.card !== false"
                >
                    <div class="p-l-key">{{val.label}}</div>
                    <div class="p-l-value" v-html="renderValue(key)"></div>
                </div>
            </div>
        </div>
    </article>
</template>

<script>
    export default {
        name: "modelItem",
        data(){
            return {
                table: null,
                id: null,
                shell: null,
                document: null,
            }
        },
        computed: {
            alias(){
                return _.capitalize(this.shell?.name?.one || this.table)
            },
            header(){
                let ret = '';
                if (['Invoice', 'Order'].includes(this.table)) ret = `${this.alias} № ${this.document.number} от ${
                  Intl.DateTimeFormat(
                    'ru-RU',
                    {
                        year: '2-digit', month: 'numeric', day: 'numeric',
                        hour: 'numeric', minute: 'numeric',
                        hour12: false
                    }).format(new Date(this.document.date)).replace(',','')
                }`;

                return ret;
            }
        },
        methods:{
            renderValue(key){
                return this.shell.initial[key].html ? this.shell.initial[key].html(this.document) : this.document.key;
            },
            loadItem(route){
                this.table = route.params.table;
                this.id = parseInt(route.params.id);
                this.$set(this, "shell", this.$store.getters['TABLES/GET_SHELL'](this.table));
                this.$set(this, 'document', null);
                this.$store.dispatch('CARDS/LOAD_DOCUMENT', {model: this.table, id: this.id})
                  .then(ans=>this.$set(this, 'document', ans.data))
            }
        },
        mounted() {
            this.loadItem(this.$route);
        },
        beforeRouteUpdate(to, from, next){
            this.loadItem(to);
            next();
        }
    }
</script>

<style scoped lang="less">
    @import "~@/less/_variables";
    .p-l-card{
        .p-l-row{
            height: 40px;
            line-height: 40px;
            display: flex;
            font-size: 20px;
            .p-l-key{
                min-width: 150px;
            }
            .p-l-value{
                min-width: 50px;
            }
        }
    }
</style>