<template>
    <div class="component">
        <div class="left-part">
            <b-form-input
                    type="text"
                    v-model="value.search"
                    placeholder="Строка поиска"
                    class="p-l-search"
            />
            <div class="p-l-filter">
                <b-form-input
                  class="p-l-input"
                  type="number"
                  min="1"
                  v-model="value.quantity"
                  :formatter="intFormatter"
                  placeholder="Мин количество"
                >
                </b-form-input>
                <div class="p-l-alias">Мин. количество</div>
                <div class="p-l-additional">ед-цы</div>
                <b-form-checkbox
                  class="p-l-checkbox"
                  size="sm"
                  v-model="value.fromQuantity"
                  switch></b-form-checkbox>
            </div>
            <div class="p-l-filter">
                <b-form-input
                  class="p-l-input"
                  type="number"
                  min="1"
                  v-model="value.relevance"
                  :formatter="intFormatter"
                  placeholder="Мин актуальность"
                >
                </b-form-input>
                <div class="p-l-alias">Мин.актуальность</div>
                <div class="p-l-additional">часы</div>
                <b-form-checkbox
                  class="p-l-checkbox"
                  size="sm"
                  v-model="value.fromRelevance"
                  switch></b-form-checkbox>
            </div>

            <div class="p-l-filter p-l-card">
                <span
                  class="p-l-checkbox"
                  id="PLCheckbox"
                  v-b-tooltip:hover
                >
                    <b-tooltip target="PLCheckbox" triggers="hover">Учитывать только сохранённую информацию</b-tooltip>
                    <b-form-checkbox
                      size="sm"
                      v-model="value.onlyDB"
                      switch></b-form-checkbox>
                </span>
                <div class="p-l-alias">Склады</div>
                <b-dropdown
                  variant="transparent"
                  size="sm"
                  class="p-l-dropd"
                >
                    <b-form-checkbox-group
                      v-model="value.selectedStores"
                      class="checkbox"
                      :options="options"
                      stacked
                    />
                </b-dropdown>
            </div>
        </div>
        <div class="stores">


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
            options(){
                return this.value.references.stores.map((store)=>{return{
                    value: store.id,
                    html:
`<div id="Store_${store.id}">
  <span style="color:${store._loading ? 'red' : ''}">${store._loading ? '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="download" class="svg-inline--fa fa-download fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg> ' : ''} ${store.company.party.name} - ${store.name}</span>
</div>`
                }})
            },
        },
        methods:{
            //abort(sid){
            //    let uid = this.value._forProcessing.promises[sid.toString()];
            //    let source = this.$store.getters['TABLES/GET_AXIOS_SOURCES'](uid);
            //    source.cancel('aborted')
            //},
            intFormatter(val, e){
                let ret = parseInt(val);
                if (!ret) ret = 1
                return parseInt(ret);
            },
            htmlEntities(str) {
                return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            }
        },
    }

    //function cancelAxios(val){
    //    console.log(val)
    //}
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
            min-width: 400px;
        }
        > div.left-part{
            display: flex;
            justify-content: space-between;
            > *{
                flex: 1 1 auto;
                align-self: center;
                margin: 10px;
                height: 50px;
            }
            .p-l-search{width: 300px; font-size: 24px}
            .p-l-card{
                border: rgb(206,212,218) solid 1px;
                border-radius: 4px;
            }
            .p-l-filter{
                min-width: 120px;
                height: 50px;
                position: relative;
                >*{position: absolute}
                .p-l-dropd{
                    right: 0;
                    top:0;
                    .checkbox{
                        white-space: nowrap !important;
                        margin: 10px;
                    }
                }
                .p-l-alias{
                    top: 0;
                    left: 10px;
                    font-size: 10px;
                    opacity: 0.5;
                }
                .p-l-additional{
                    bottom: 0;
                    left: 30px;
                    font-size: 10px;
                    opacity: 0.5;
                }
                .p-l-input{
                    top: 0;
                    left: 0;
                    width: 120px;
                    padding-left: 30px;
                    height: 50px;
                    font-size: 20px;
                }
                .p-l-checkbox{
                    top: 15px;
                    left: -5px;
                    max-width: 20px;
                }
            }
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