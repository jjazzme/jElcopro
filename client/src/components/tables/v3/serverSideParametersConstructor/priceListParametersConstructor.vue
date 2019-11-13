<template>
    <div class="component">
        <div class="left-part">
            <b-form-input
                    type="text"
                    v-model="value.search"
                    placeholder="Строка поиска"
            />
            <b-form-input
                    type="number"
                    min="1"
                    v-model="value.quantity"
                    :formatter="intFormatter"
                    placeholder="Минимальное количество"
            />
            <div>
                <b-form-checkbox
                  v-model="value.fromQuantity"
                  switch>
                    Учитывать количество
                </b-form-checkbox>
                <b-form-checkbox
                  v-model="value.onlyDB"
                  switch>
                     только БД
                </b-form-checkbox>
            </div>
        </div>
        <div class="stores">

            <b-form-checkbox-group
              v-model="value.optics.selectedStores"
              class="checkbox"
              :options="options"
              stacked
            >
            </b-form-checkbox-group>
        </div>
    </div>
</template>

<script>
    import Swal from 'sweetalert2'
    export default {
        name: "priceListParametersConstructor",
        data(){
            return {

            }
        },
        props:{
            value: {type: Object,}
        },
        computed: {
            loading(){return this.value.data.promiseSources},
            options(){
                return this.value.data.stores.map(function(store){return{
                    value: store.id,
                    html:
`<div id="Store_${store.id}">
  <span style="color:${store._loading ? 'red' : ''}">${store._loading ? '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="download" class="svg-inline--fa fa-download fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg> ' : ''}${store.company.party.name} - ${store.name} </span>
</div>`
                }})
            },
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
    }

    function cancelAxios(val){
        console.log(val)
    }
</script>

<style scoped lang="less">
    .component{
        display: flex;
        flex: 1 1 1;
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