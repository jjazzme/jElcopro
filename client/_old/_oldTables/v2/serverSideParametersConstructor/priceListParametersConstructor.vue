<template>
    <div class="component">
        <div class="left-part">
            <b-form-input
                    type="text"
                    v-model="value.searchString"
                    placeholder="Строка поиска"
            />
            <b-form-input
                    type="number"
                    min="1"
                    v-model="value.quantity"
                    :formatter="intFormatter"
                    placeholder="Минимальное количество"
            />
            <b-form-checkbox
                    v-model="value.fromQuantity"
                    switch>
                Учитывать количество
            </b-form-checkbox>
        </div>
        <div class="stores" v-if="stores.length>0">
            <div
                    v-for="(store, storeInd) in stores"
                    :key="store.value"
                    class="store"
            >
                <b-form-checkbox
                        v-model="store.selected"
                        class="checkbox"
                >
                    {{store.text}}
                </b-form-checkbox>
                <div
                        class="loading"
                        v-if="loading[store.value]"
                        title="Прервать"
                        @click="abort(store.value)"
                >
                    <fa-icon class="abort" icon="times" />
                    <b-spinner
                            small
                            class="spinner"
                            variant="warning"
                            label="Загрузка..."
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Swal from 'sweetalert2'
    export default {
        name: "priceListParametersConstructor",
        data(){
            return {
                stores:[],
            }
        },
        props:{
            value: {type: Object,}
        },
        computed: {
            loading(){return this.value._forProcessing.loading}
        },
        created() {
            this.$store.dispatch('TABLES/LOAD_REFDATA', 'Store')
                .then(r=>{
                    this.$set(this.value._forProcessing, 'stores', r)
                    this.$set(this, 'stores', _.map(r, item=>{return {text: `${item.company.party.name} - ${item.name}`, value: item.id, selected: !item.online}}));
                    this.$set(this.value, 'selectedStores', _.map(r, item=>{if (!item.online) item.id}));
                })
                .catch(e=>{
                    Swal.fire({
                        title: 'Ошибка получения модели Store',
                        text:  e,
                        type:  'error',
                        timer: 10000
                    });
                })
        },
        methods:{
            abort(sid){
                let uid = this.value._forProcessing.promises[sid.toString()];
                let source = this.$store.getters['TABLES/GET_AXIOS_SOURCES'](uid);
                source.cancel('aborted')
            },
            intFormatter(val, e){
                let ret = parseInt(val);
                if (!ret) ret = 1
                return parseInt(ret);
            }
        },
        watch:{
            stores: {
                handler: function(n){
                    const selected = _.filter(n, item=>item.selected);
                    this.$set(this.value, 'selectedStores', _.map(selected , item=>item.value));
                },
                deep: true
            },
            //'value.fromQuantity'(n) {
            //    if(n && !this.value.quantity) this.$set(this.value, 'quantity', 1);
            //    if(!n && this.value.quantity === 1) this.$set(this.value, 'quantity', null);
            //}
        },
    }
</script>

<style scoped lang="less">
    .component{
        display: flex;
        justify-content: space-between;
        > div{
            flex: 1 1 auto;
            align-self: stretch;
            margin: 10px;
            min-width: 500px;
        }
        > div.left-part{
            display: flex;
            justify-content: space-between;
            > *{
                flex: 1 1 auto;
                align-self: center;
                margin: 10px;
            }
            input{min-width: 80px;}
            input:nth-child(2){max-width: 80px}
            >div{min-width: 250px}
        }
        .stores{
            .store{
                height: 30px;
                display: flex;
                align-items: center;
                flex-flow: row nowrap;
                .checkbox{
                    margin-right: 10px;
                }
                .loading{
                    cursor: pointer;
                    position: relative;
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    .abort{position: absolute; color: red; width: 12px; height: 12px; top: 4px; left: 4px; opacity: 0.5;}
                    .spinner{position: absolute; width: 20px; height: 20px}
                }
            }
        }
    }
</style>