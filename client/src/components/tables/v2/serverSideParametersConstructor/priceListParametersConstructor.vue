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
                    v-model="value.quantity"
                    placeholder="Минимальное количество"
            />
            <b-form-checkbox
                    v-model="value.fromQuantity"
                    switch>
                Учитывать количество
            </b-form-checkbox>
        </div>
        <div class="stores" v-if="stores.length>0">
            <b-form-checkbox
                    v-for="store in stores"
                    :key="store.value"
                    v-model="value.selectedStores"
                    :value="store.value"
                    stacked
            >
                {{store.text}}
                <b-spinner
                        small
                        variant="warning"
                        label="Загрузка..."
                        v-if="loading[store.value]"
                />
            </b-form-checkbox>
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
            loading(){return this.value.loading}
        },
        created() {
            this.$store.dispatch('TABLES/LOAD_MODEL', 'Store')
                .then(r=>{
                    this.$set(this.value, 'stores', r)
                    this.$set(this, 'stores', _.map(r, item=>{return {text: `${item.company.party.name} - ${item.name}`, value: item.id}}));
                    this.$set(this.value, 'selectedStores', _.map(r, item=>item.id));
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
        watch:{
            'value.fromQuantity'(n) {
                if(n && !this.value.quantity) this.$set(this.value, 'quantity', 1);
                if(!n && this.value.quantity === 1) this.$set(this.value, 'quantity', null);
            }
        },
    }
</script>

<style scoped lang="scss">
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
            input{min-width: 70px;}
            input:nth-child(2){max-width: 70px}
            >div{min-width: 250px}
        }
    }
</style>