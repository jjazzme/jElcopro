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

            <div>
                <div> Связанные документы:</div>
                <div v-if="parent">
                    Родительский:
                    <b-button
                      variant="link"
                      :to="{name: 'modelItem', params: {type: parent.type, id: parent.id}}"
                    >{{parent.alias}}</b-button>
                </div>
                <div v-if="children.length>0">
                    <div
                      v-for="child in children"
                    >
                        Дочерний:
                        <b-button
                          variant="link"
                          :to="{name: 'modelItem', params: {type: child.type, id: child.id}}"
                        >{{child.alias}}</b-button>
                    </div>
                </div>
            </div>

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
                statusSwitcher: {
                    statuses: {
                        formed: 'Формируется',
                        reserved: 'В резерве',
                        in_work: 'В работе',
                        closed: 'Закрыт'
                    },
                    Invoice: [
                        { name: 'reserve', from: 'formed', to: 'reserved', vector: 1 },
                        { name: 'unreserve', from: 'reserved', to: 'formed', vector: -1 },
                        { name: 'toWork', from: 'reserved', to: 'in_work', vector: 1 },
                        { name: 'unWork', from: 'in_work', to: 'reserved', vector: -1 },
                        { name: 'close', from: 'in_work', to: 'closed', vector: 1 },
                    ],
                    Order: [
                        { name: 'toWork', from: 'formed', to: 'in_work', vector: 1 },
                        { name: 'unWork', from: 'in_work', to: 'formed', vector: -1 },
                        { name: 'close', from: 'in_work', to: 'closed', vector: 1 },
                    ],
                },
            }
        },
        computed: {
            parent(){
                const parent = this.document.parent;
                if (!parent) return null;;
                const name = {order: 'Заказ', invoice: 'Счёт', 'transfer-in': 'Входящий УПД', 'transfer-out': 'Исходящий УПД'}[parent.document_type_id];
                const alias = `${name} № ${parent.number}`
                const type = {order: 'Order', invoice: 'Invoice', 'transfer-in': 'TransferIn', 'transfer-out': 'TransferOut'}[parent.document_type_id];
                const id = parent.id;
                return { alias, type, id }
            },
            children(){
                let ret = []
                _.forEach(this.document.children, child=>{
                    const name = {order: 'Заказ', invoice: 'Счёт', 'transfer-in': 'Входящий УПД', 'transfer-out': 'Исходящий УПД'}[child.document_type_id];
                    const alias = `${name} № ${child.number}`
                    const type = {order: 'Order', invoice: 'Invoice', 'transfer-in': 'TransferIn', 'transfer-out': 'TransferOut'}[child.document_type_id];
                    const id = child.id;
                    ret.push( { alias, type, id } );
                });
                return ret;
            },
            selectedItems () {
                return this.document.documentLines.map( line => { if ( line._selected ) return line.id } ).filter( item => item );
            },
            model () { return { document: this.document, shell: this.shell, statusSwitcher: this.statusSwitcher, selectedItems: this.selectedItems } },
            alias () {
                return _.capitalize(this.shell?.shell?.name?.one || this.type)
            },
            header () {
                let ret = '';
                if (['Invoice', 'Order', 'TransferIn', 'TransferOut'].includes(this.shell?.type)) ret = `${this.alias} № ${this.document.number} от ${
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