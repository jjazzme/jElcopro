<template>
    <header v-if="stores && stores.length>0">
        <b-form-input
          type="text"
          v-model="optics.search"
          placeholder="Строка поиска"
          class="p-l-search"
        />
        <div class="p-l-filter">
            <b-form-input
              class="p-l-input"
              type="number"
              min="1"
              v-model="optics.quantity"
              :formatter="intFormatter"
              :number="true"
              placeholder="Мин количество"
            >
            </b-form-input>
            <div class="p-l-alias">Мин. количество</div>
            <div class="p-l-additional">ед-цы</div>
            <span
              :title="user.skills.interface >= enums.userLevel.Junior ? 'Показать больше или равно количеству и оптимизировать вывод' : ''"
              class="p-l-checkbox"
              id="PLCQua"
            >
                   <b-form-checkbox
                     size="sm"
                     v-model="optics.fromQuantity"
                     switch></b-form-checkbox>
                    <b-tooltip
                      v-if="user.skills.interface<enums.userLevel.Junior"
                      target="PLCQua"
                      triggers="hover">Показать больше или равно количеству и оптимизировать вывод</b-tooltip>
                </span>
        </div>
        <div class="p-l-filter">
            <b-form-input
              class="p-l-input"
              type="number"
              min="1"
              v-model="optics.relevance"
              :number="true"
              :formatter="intFormatter"
              placeholder="Мин актуальность"
            >
            </b-form-input>
            <div class="p-l-alias">Мин.актуальность</div>
            <div class="p-l-additional">часы</div>
            <span
              :title="user.skills.interface >= enums.userLevel.Junior ? 'Показывать только актуальные для заданного количества часов' : ''"
              class="p-l-checkbox"
              id="PLCAct"
            >
                    <b-form-checkbox
                      size="sm"
                      v-model="optics.fromRelevance"
                      switch/>
                    <b-tooltip
                      v-if="user.skills.interface<enums.userLevel.Junior"
                      target="PLCAct"
                      triggers="hover">Показывать только актуальные для заданного количества часов</b-tooltip>
                </span>
        </div>

        <div class="p-l-filter p-l-card">
                <span
                  :title="user.skills.interface >= enums.userLevel.Junior ? 'Учитывать только сохранённую в базе данных информацию' : ''"
                  class="p-l-checkbox"
                  id="PLCDBs"
                >
                    <b-tooltip
                      v-if="user.skills.interface<enums.userLevel.Junior"
                      target="PLCDBs"
                      triggers="hover">Учитывать только сохранённую в базе данных информацию</b-tooltip>
                    <b-form-checkbox
                      size="sm"
                      v-model="optics.onlyDB"
                      switch></b-form-checkbox>
                </span>
            <store-icons
              class="p-l-icons"
              v-model="iconsModel"
            ></store-icons>
            <div class="p-l-alias">Склады</div>
            <b-dropdown
              variant="transparent"
              size="sm"
              class="p-l-dropd"
            >
                <b-form-checkbox-group
                  v-model="optics.selectedStores"
                  class="checkbox"
                  :options="options"
                  stacked
                />
            </b-dropdown>
        </div>
    </header>
</template>

<script>
    import Enums from "../../../modules/enums";
    import StoreIcons from "./storeIcons";

    export default {
        name: "priceListParametersConstructor",
        components: {StoreIcons},
        props:{
            value: null,
        },
        data(){
            return {
                user: this.value.dataSource.user,
                enums: new Enums(),
            }
        },
        computed: {
            stores(){
                return this.value.dataSource.tables.Store.data;
            },
            iconsModel(){
                return { optics: this.optics, stores: this.stores }
            },
            optics(){
                return this.value.dataSource.tables[this.value.dataSource.type].optics.value
            },
            options(){
                return this.stores.map((store)=>{return{
                    value: store.id,
                    html:
`<div id="Store_${store.id}">
  <span style="color:${store._loading ? 'red' : ''}">${store._loading ? '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="download" class="svg-inline--fa fa-download fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg> ' : ''} ${store.company.party.name} - ${store.name}</span>
</div>`
                }})
            },
        },
        methods:{
            intFormatter(val, e){
                let ret = parseInt(val);
                if (!ret) ret = 1;
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
    @import "~@/less/_variables";
    header{
        display: flex;
        flex-flow: row wrap;
        > *{
            flex: 0 1 auto;
            align-self: center;
            height: 50px;
            margin: 5px;
        }
        @media @wid {>*{margin: 10px;}}

        .p-l-search{
            width: 300px;
            font-size: 24px
        }
        .p-l-card{
            border: rgb(206,212,218) solid 1px;
            border-radius: 4px;
            width: 160px;
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
            .p-l-icons{
                top: 10px;
                left: 30px;
                font-size: 20px;
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
        @media @mob {
            .p-l-search{
                width: 100%;
            }
            .p-l-card{
                //width: 50%;
            }
            .p-l-filter{
                //width: 45%;
            }
        }
    }
</style>