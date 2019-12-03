<template>
    <article>
        <page-environment
                :head="{title: {main: 'карточка', method: alias }}"
        />
        <div v-if="document">
            <h1>{{header}} </h1>
            <item-body
              v-model="model"
            />
            <item-lines
              v-model="model"
            />

        </div>
    </article>
</template>

<script>
    import {Shells} from "../../classLib/TableSource";
    import ItemBody from "../../components/item/itemBody";
    import ItemLines from "../../components/item/itemLines";

    export default {
        name: "modelItem",
        components: {ItemLines, ItemBody},
        data(){
            return {
                shell: null,
                id : null,
                document: null,
            }
        },
        computed: {
            model () { return { document: this.document, shell: this.shell } },
            alias () {
                return _.capitalize(this.shell?.shell?.name?.one || this.type)
            },
            header () {
                let ret = '';
                if (['Invoice', 'Order'].includes(this.shell?.type)) ret = `${this.alias} № ${this.document.number} от ${
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

            loadItem(route){
                this.$set(this, 'shell',  new Shells(route.params.type));
                this.$set(this, 'id', parseInt(route.params.id));
                this.$set(this, 'document', null);
                this.$store.dispatch('LOADER/getItem', { type: this.shell.type, payload: { id: this.id } })
                  .then(ins=>this.$set(this, 'document', ins))
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
    h1{text-align: center}
</style>