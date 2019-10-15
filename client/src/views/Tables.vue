<template>
    <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
    <article>
        <div v-if="loadingStatus<=enumLoadingStatus.TableLoading" class="v-t-loader">
            <!--СПИННЕР-->
            <b-spinner class="v-t-l-spinner" variant="warning" label="Загрузка..." />
        </div>
        <div
                class="v-table"
                ref="tab"
        >
            <!-- ВСЯ ТАБЛИЦА -->
            <paginator
                    :class="`${loadingStatus<enumLoadingStatus.TableLoaded?'transp':''} text-center`"
                    v-model="table.shell.optics"
            ></paginator>

            <div
                    :class="`${loadingStatus===enumLoadingStatus.TableLoading?'tran05':''} v-t-header`"
                    :style="headerRowStyle"
                    v-if="loadingStatus>=enumLoadingStatus.TableLoading"
            >
                <!--ЗАГОЛОВОК ТАБЛИЦЫ-->
                <div
                        class="v-t-col text-center p-0 m-0"
                        style="min-width: 70px; max-width: 70px; order:-1000000"
                >
                    <!--ПЕРВАЯ ЯЧЕЙКА ЗАГОЛОВКА-->
                    <b-form-checkbox
                            v-model="showBasket"
                            :disabled="table.shell.basket.length===0"
                            name="check-button"
                            button
                            size="sm"
                            :button-variant="table.shell.basket.length===0?'outline-primary':'outline-danger'"
                    >{{table.shell.basket.length}}</b-form-checkbox>
                    <b-dropdown
                            text=""
                            :variant="tableOptionsIsInitial?'outline-primary':'outline-danger'"
                            size="sm"
                            title="Опции таблицы"
                            class=""
                    >
                        <b-form-checkbox
                                v-if="i.hidden!==true"
                                v-for="(i,k) in table.shell.columns"
                                :key="k"
                                v-model="i.show"
                        >{{i.label}}</b-form-checkbox>
                        <b-button
                                @click="optiTab"
                                variant="link"
                        >Оптимизировать вид</b-button>
                        <b-button
                                @click="reset"
                                variant="link"
                        >Сбросить фильтры</b-button>
                    </b-dropdown>
                </div>

                <div
                        v-for="(v, k, i) in table.shell.columns"
                        v-show="table.shell.columns[k].show"
                        class="v-t-col"
                        :key="i"
                        :style="style[k]"
                        :data-header="k"
                        :data-index="table.shell.columns[k].order"
                        :data-index-main="table.shell.columns[k].order"
                        @dragover="dragover"
                        @dragleave="dragleave"

                >
                    <div
                            v-if="table.shell.columns[k].hidden !== true"
                            class="v-t-row"
                            :data-index="table.shell.columns[k].order"
                    >
                                <span
                                        class="h-c-text"
                                        :data-index="table.shell.columns[k].order"
                                >
                                    {{v.label}}
                                </span>
                        <span
                                class="h-c-tools"
                                :data-index="table.shell.columns[k].order"
                        >
                                    <b-dropdown
                                            :variant="columnsOptionsVariant[k] ? 'outline-primary' : 'outline-warning'"
                                            size="sm"
                                            no-caret
                                            class="h-c-options"
                                    >
                                        <template slot="button-content">
                                            <span
                                                    class="fa h-c-drag sm position-relative"
                                                    :class="`${table.shell.optics.sorters[k].value === '' ? 'fa-bars' : table.shell.optics.sorters[k].value === 'asc' ? 'fa-sort-amount-asc' : 'fa-sort-amount-desc'}`"
                                                    @dragstart="dragChangeStart"
                                                    @dragend="dragChangeEnd"
                                                    draggable="true"
                                                    :data-index="table.shell.columns[k].order"
                                            >
                                                <span
                                                        class="position-absolute"
                                                        style="top:-2px; left: -10px; color: white; font-size: 10px"
                                                >{{table.shell.optics.sorters[k].order===null?'':table.shell.optics.sorters[k].order}}</span>
                                            </span>
                                        </template>
                                        <b-dropdown-group
                                                v-if="table.shell.columns[k].sortable"
                                        >
                                            <b-dropdown-item
                                                    @click="tableSort(k, 'asc')"
                                                    :disabled="table.shell.optics.sorters[k].value ==='asc'"
                                            >
                                                Сортировать А...Я <i class="fa fa-sort-amount-asc"></i>
                                            </b-dropdown-item>
                                            <b-dropdown-item
                                                    @click="tableSort(k, 'desc')"
                                                    :disabled="table.shell.optics.sorters[k].value ==='desc'"
                                            >
                                                Сортировать Я...А <i class="fa fa-sort-amount-desc"></i>
                                            </b-dropdown-item>
                                            <b-dropdown-item
                                                    @click="tableSort(k, null)"
                                                    :disabled="!table.shell.optics.sorters[k].value"
                                            >
                                                Не сортировать
                                            </b-dropdown-item>
                                        </b-dropdown-group>
                                        <b-dropdown-group

                                        >
                                            <filters
                                                    v-if="table.shell.optics.filters[k]"
                                                    v-model="table.shell.optics.filters[k]"
                                            ></filters>
                                        </b-dropdown-group>
                                        <b-dropdown-item
                                                @click="table.shell.columns[k].show=false"
                                                variant="danger"
                                        >Скрыть</b-dropdown-item>
                                    </b-dropdown>
                            <!--i class="h-c-drag fas fa-grip-vertical"></i-->
                                    <span
                                            :data-index="table.shell.columns[k].order"
                                            class="fa fa-ellipsis-v h-c-sizing"
                                            @dragstart="dragResizeStart"
                                            @drag="dragResize"
                                            draggable="true"
                                    ></span>
                                </span>
                    </div>
                </div>
            </div>
            <div
                    :class="shading?'tran05':''"
            >
                <!--БОДИ ТАБЛИЦЫ-->
                <div
                        :style="rowStyle"
                        v-for="(row, i1) in tableData"
                        class="v-t-data-row"
                        :key="i1"
                        :data-id="row.id"
                >
                    <div
                            class="v-t-col text-center"
                            style="min-width: 70px; max-width: 70px; order:-1000000"
                            :data-id="`t_ch_${row.id}`"
                    >
                        <!--ПЕРВАЯ ЯЧЕЙКА СТРОКИ-->
                        <b-form-checkbox
                                size="sm"
                                class="d-inline-block pl-4 pr-0"
                                :key="`t_ch_${row.id}`"
                                @change="basketChange(row.id)"
                                :checked="table.shell.basket.filter(i=>{return i.id===row.id}).length>0"
                        ></b-form-checkbox>
                        <b-dropdown
                                text=""
                                :variant="`${dataChanged[row.id]?'outline-warning':'outline-dark'}`"
                                size="sm"
                        >
                            <b-dropdown-item
                                    v-if="dataChanged[row.id]"
                                    variant="varning"
                                    @click="rowReturn(row.id)"
                            >До редактирования</b-dropdown-item>
                            <b-dropdown-item
                                    v-if="getPermission(enumPermission.Update, row.id)"
                            >
                                <router-link
                                        :to="{name:'tabledit', params: {table: table.name, id:row.id}}"
                                        class="fa fa-pencil-square"
                                > редактировать</router-link>
                            </b-dropdown-item>

                        </b-dropdown>
                    </div>
                    <div
                            @contextmenu="editClick"
                            v-for="(v2, k2) in row"
                            :key="k2"
                            class="v-t-col my-auto"
                            :style="style[k2]"
                            :data-column="k2"
                            v-show="table.shell.columns[k2].show"
                            v-if="table.shell.columns[k2].hidden !== true"
                    >
                            <span
                                    @focusout="focusOutCell"
                                    @input="inputCell"
                                    @click="clickCell"
                                    :data-value="table.data.filter(i=>i.id===row.id)[0][k2]"
                                    :data-column="k2"
                                    :data-key="row.id"
                                    :class="`${table.shell.columns[k2].parentClass?table.shell.columns[k2].parentClass:''} ${table.shell.columns[k2].to?'link':''}`"
                                    v-html="v2"
                            />
                    </div>
                </div>
            </div>

            <paginator
                    :class="`${loadingStatus<enumLoadingStatus.TableLoaded?'transp':''} text-center`"
                    v-model="table.shell.optics"
            ></paginator>
        </div>
        <div style="display: none" id="warehouse">
            <b-form-select
                    id="inputSelect"
                    :options="inputSelectOptions"
                    v-model="inputSelectedValue"
                    v-on:change="inputSelectChange"
            ></b-form-select>
        </div>
    </article>
</template>

<script>
    import Vue from 'vue'
    import paginator from '../components/tables/v1/paginator';
    import filters from "../components/tables/v1/filters";
    import Swal from 'sweetalert2';
    //import _  from 'lodash';
    export default {
        name: "vTable",
        components: {
            paginator,
            filters
        },
        data() {
            return {
                drag:{before:0, column:null, from:0, startObjWidth:0, startX: 0},
                enumLoadingStatus: Object.freeze({None:-10, Begin:0, Authenticated: 10, ShellLoaded:20, TableLoading:30, TableLoaded:40, TablePreDisplayed:50, TableDisplayed:60, TableSaved: 70}),
                enumPermission: Object.freeze({Create:'Create',Read:'Read',Update:'Update',Delete:'Delete'}),
                headerHeight: 30,
                inputSelectedValue: null,
                inputSelectOptions: [],
                loadingStatus: -10,
                oldBasket: null,
                oldColumns: null,
                oldOptics: null,
                rowWidth: 0,
                showBasket: false,
                table: null,
                WFTcounter: -1,
                shading: false,
                queueSave:[],
            }
        },
        computed:{
            // main
            cacheFromOptics(){return this.loadingStatus === this.enumLoadingStatus.TableLoading ? this.$store.getters['TABLES/GET_CACHE_ITEM'](this.table) : null;},
            lastEvent(){return this.$store.getters['TABLES/GET_LAST_EVENT']},
            SHELL(){return this.$store.getters['TABLES/GET_SHELL'](this.table?.name)},
            tableData: {
                get(){
                    let sou = [];
                    if (this.showBasket){
                        sou = this.table.shell.basket;
                    } else if (this.loadingStatus >= this.enumLoadingStatus.TableLoaded) {
                        sou = this.table.data
                    } else if (this.table.iData.length>0) {
                        sou = this.table.iData
                    } else {return []}

                    let ret = [];

                    // todo тут реализовано this через переменную. В будущем проверить, что исправили хрень с this в отладчике браузера.
                    _.forEach(sou, (souRow)=>{
                        let targetRow = {};
                        _.forEach(souRow, (souVal, souKey)=>{
                            //let val;
                            const column = this.table.shell.initial[souKey];
                            if (column){
                                const html = column.html;
                                targetRow[souKey] = html ? html(souRow) : souVal;
                            }
                        });
                        ret.push(targetRow);
                    });

                    return ret;
/*
                    ret = sou.map((item) => {
                        let rem = {};
                        Object.keys(this.table.shell.columns).map((k,i) => {
                            const cName = this.table.shell.columns[k].from ? this.table.shell.columns[k].from : k;
                            let v = this.getObjectValue(item, cName);

                            if(this.table.shell.initial[k].processor){
                                try{
                                    v = this.table.shell.initial[k].processor(v);
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                            rem[k] = v;
                        });
                        return rem;
                    });
                    return ret;
                    */

                    /*


                    _.forEach(sou, (souRow)=>{
                        let targetRow = {};
                        let t = this.table;
                        _.forEach(souRow, (souVal, souKey)=>{
                            let val;
                            if(this.table.shell.initial[souKey].html){
                                try{
                                    val = this.table.shell.initial[souKey].html(souVal);
                                } catch (e) {
                                    // eslint-disable-next-line no-console
                                    console.log(e);
                                }
                            } else {
                                val = souVal;
                            }
                            targetRow[souKey] = val;
                        });
                        ret.push(targetRow);
                    });

                    return ret;

                     */
                },
                set(val){}

            },
            userID(){return this.$store.getters['AUTH/GET_USER']?.id;},

            
            // for template
            dataChanged(){
                //let ret = this.table.shell.columns[k2].parentClass;
                let ret={};
                _.forEach(this.table.data, (v,i)=>{
                    ret[v.id] = !_.isEqual(this.table.data[i], this.table.iData[i])
                });
                return ret;
            },
            columnsOptionsVariant(){
                let ret = {}
                Object.keys(this.table.shell.columns).map((k)=>{
                    ret[k] = _.isEqual(this.table.shell.optics.filters[k], this.table.shell.initial[k].filters)
                    if (this.table.shell.initial[k].sortable) {
                        ret[k] = ret[k] && _.isEqual(this.table.shell.optics.sorters[k], this.$store.getters['TABLES/GET_INITIAL_SORTER'])
                    }
                });
                return  ret;
            },
            headerRowStyle(){return `${this.rowWidth===0 ? 'width: auto' : `width: auto; height: ${this.headerHeight}px;` };`},
            tableOptionsIsInitial(){
                let ret = true;
                _.forEach(this.table.shell.columns, i=>{
                    if (i.hidden!==true && i.show===false) ret=false;
                });
                return ret;
            },
            rowStyle(){return `${this.rowWidth===0 ? 'width: auto' : `width: ${this.rowWidth}px;` };`},
            style() {
                let ret = {};
                Object.keys(this.table.shell.columns).map((k)=>{
                    ret[k] = `order: ${this.table.shell.columns[k].order}; ${this.table.shell.columns[k].style}`
                });
                return ret;
            },
        },
        methods:{
            basketChange(id){
                if(this.table.shell.basket.filter(item => {
                    return item.id===id
                }).length===0) {
                    this.table.shell.basket.push(this.table.data.filter(item =>{return item.id===id})[0])
                } else {
                    for(var i in this.table.shell.basket) {
                        if (this.table.shell.basket[i].id===id) this.table.shell.basket.splice(i,1)
                    }
                    if (this.table.shell.basket.length===0) this.showBasket = false;
                }
            },
            calcTab(){
                let temp = {};
                Object.keys(this.table.shell.columns).map((k) => {
                    let els = this.$refs.tab.querySelectorAll(`div[data-column="${k}"]`);
                    let height = 20;
                    let width = 60;
                    let paddingL = 5;
                    let paddingR = 5;
                    let length = 0;
                    els.forEach(item=>{
                        if (item.querySelector('span').offsetHeight>height) height = item.querySelector('span').offsetHeight;
                        if (item.querySelector('span').offsetWidth>width) width = item.querySelector('span').offsetWidth;
                        if (item.querySelector('span').innerText.length>length) length = item.querySelector('span').innerText.length;
                        if (paddingL< parseInt(getComputedStyle(item).paddingLeft.replace('px',''))) paddingL = parseInt(getComputedStyle(item).paddingLeft.replace('px',''));
                        if (paddingR< parseInt(getComputedStyle(item).paddingRight.replace('px',''))) paddingR = parseInt(getComputedStyle(item).paddingRight.replace('px',''))
                    });
                    temp[k]={};
                    temp[k].width = width;
                    temp[k].height = height;
                    temp[k].length = length;
                    temp[k].padding = paddingL+paddingR+2
                });
                let maxLen = 0
                Object.keys(temp).map((k)=>{
                    if (temp[k].length>maxLen) maxLen=temp[k].length
                });
                Object.keys(temp).map((k)=>{
                    if (temp[k].length === maxLen) {
                        Vue.set(this.table.shell.columns[k], 'style', 'min-width: auto; max-width: 100%;');
                    } else {
                        Vue.set(this.table.shell.columns[k], 'style', `min-width: ${temp[k].width + temp[k].padding}px; max-width: ${temp[k].width + temp[k].padding}px;`);
                    }
                });
            },
            clickCell(e){
                const obj = e.target;
                if (!(obj.contentEditable==='true') && $(obj).hasClass('link')){
                    const name = this.table.shell.columns[$(obj).attr('data-column')].to.name;
                    const params = {id: $(obj).attr('data-key')}; //<-------------
                    this.$router.push({name: name, params: params});
                }
            },
            delayedSetOptics: _.debounce(function (n) {
                this.setOptics(n);
            }, 1000),
            dragChangeEnd(){
                Object.keys(this.table.shell.columns).map((k)=>{
                    if(this.table.shell.columns[k].order===this.drag.from) {this.table.shell.columns[k].order=this.drag.before-1}
                    else if(this.table.shell.columns[k].order<this.drag.before) this.table.shell.columns[k].order--
                });
            },
            dragChangeStart(evt){
                this.drag.from = parseInt(evt.srcElement.getAttribute('data-index'));
                this.drag.column = this.$refs.tab.querySelector(`div[data-index-main="${this.drag.from}"]`).getAttribute("data-header");
            },
            dragleave(evt){
                let dbe = evt.srcElement;
                while (!dbe.getAttribute('data-index')) {
                    dbe = dbe.parentElement;
                }
                let dragBefore = parseInt(dbe.getAttribute('data-index'));
                const mainDragOver = this.$refs.tab.querySelector(`div[data-index-main="${dragBefore}"]`);
                mainDragOver.style.background = '';
            },
            dragover(evt){
                let dbe = evt.srcElement;
                while (!dbe.getAttribute('data-index')) {
                    dbe = dbe.parentElement;
                }

                this.drag.before = parseInt(dbe.getAttribute('data-index'));
                const mainDragOver = this.$refs.tab.querySelector(`div[data-index-main="${this.drag.before}"]`);
                const centerX = mainDragOver.getBoundingClientRect().left + mainDragOver.offsetWidth / 2;
                let add = 0;
                if (centerX<evt.clientX) add = 1;
                const dif = this.drag.from - (this.drag.before + add)
                if ( dif>0 || dif<-1)
                {
                    if (add===0) {
                        mainDragOver.style.background='linear-gradient(90deg, silver, black)';
                    } else {
                        mainDragOver.style.background='linear-gradient(90deg, black, silver)';
                    }
                    this.drag.before = this.drag.before + add;
                } else {
                    this.drag.before = -1;
                    mainDragOver.style.background = '';
                }
            },
            dragResizeStart(evt){
                this.drag.startX = evt.clientX;
                this.drag.column = evt.srcElement.parentElement.parentElement.parentElement.getAttribute('data-header');
                this.drag.startObjWidth = evt.srcElement.parentElement.parentElement.parentElement.offsetWidth;
            },
            dragResize: _.throttle(function(evt){
                if(evt.clientX !== 0)
                {
                    let width = this.drag.startObjWidth + evt.clientX - this.drag.startX;
                    if(width<60) width=60;
                    Vue.set(this.table.shell.columns[this.drag.column], 'style', `min-width: ${width}px; max-width: ${width}px;`);
                    this.setRowWidth();
                }
            }, 200),
            editClick(e){
                e.preventDefault();
                const obj = $($(e.target).closest('div.v-t-col')[0]).find('>span')[0];

                const id = obj.getAttribute('data-key');
                const col = obj.getAttribute('data-column');
                if(this.getPermission(this.enumPermission.Update, id, col )){
                    let eType = 'none';
                    if (obj.getAttribute('data-column') && this.table.shell.columns[obj.getAttribute('data-column')].editor ) eType = this.table.shell.columns[obj.getAttribute('data-column')].editor;
                    if (eType === 'string') {
                        if(obj.contentEditable!==true){
                            obj.contentEditable = true;
                            obj.focus();
                        } else{
                            obj.contentEditable = false;
                            //obj.focusOutCell(obj);
                        }
                    } else if (eType==='selector'){
                        if(document.getElementById('inputSelect').parentElement.id!=='warehouse'){
                            // перемещение селектора
                            document.getElementById('inputSelect').parentElement.getElementsByTagName('span')[0].style.display='inline';
                        }
                        this.inputSelectOptions = [];
                        const sou = this.table.shell.columns[obj.getAttribute('data-column')].source;
                        this.$store.dispatch('TABLES/GET_OPTIONS',{name: sou, value: $(obj).attr('data-value'), text: obj.innerText}).then(
                            r=>{
                                this.inputSelectOptions = r.options;
                                this.inputSelectedValue = r.selected;
                            },
                            e=>{
                                Swal.fire({
                                    title: 'Ошибка селектора',
                                    text:  e,
                                    type:  'error',
                                    timer: 10000
                                });
                            }
                        );

                        //this.inputSelectOptions = this.table.shell.columns[obj.getAttribute('data-column')].editor_values;


                        obj.style.display = 'none';
                        obj.parentElement.appendChild(document.getElementById('inputSelect'));
                    }
                }

            },
            focusOutCell(obj) {
                let eType = 'string'
                if (obj.target.getAttribute('data-column') && this.table.shell.columns[obj.target.getAttribute('data-column')].editor ) eType = this.table.shell.columns[obj.target.getAttribute('data-column')].editor
                if (eType === 'string') {
                    obj.target.contentEditable = false;
                    Vue.set(
                        this.table.data.filter(i=>i.id===parseInt(obj.target.getAttribute('data-key')))[0],
                        obj.target.getAttribute('data-column'),
                        obj.target.innerText
                    )
                    //this.table.iData.push([]);
                    //this.table.iData.pop();
                }
            },
            focusOutCellElement(obj){
                console.log(obj)
            },
            flattenObject(obj, prefix=''){
                Object.keys(obj).reduce((acc, k) => {
                    const pre = prefix.length ? prefix + '.' : '';
                    if (typeof obj[k] === 'object') Object.assign(acc, this.flattenObject(obj[k], pre + k));
                    else acc[pre + k] = obj[k];
                    return acc;
                }, {})
            }, //<---------------------
            getObjectValue(obj, name){
                let ret = null;
                const splitedName = name.split('.')
                if (splitedName.length===1) {
                    ret = obj[name];
                } else {
                    const oChild = obj[splitedName[0]];
                    if (oChild) {
                        splitedName.shift();
                        ret = this.getObjectValue(oChild, splitedName.join('.'));
                    } else {
                        ret = null
                    }
                }
                return ret;
            },
            getPermission(type, id=null, col=null) {
                const table = this.table.name;
                let v = {
                    Create: col?id?undefined:undefined:id?undefined:null,
                    Read:null,
                    Update:null,
                    Delete:col?undefined:null
                };
                // eslint-disable-next-line no-constant-condition
                if (1===1){
                    v = {Create:true,Read:true,Update:true,Delete:true};
                } else {
                    _.forEach(v, (p,k)=>{
                        if (p===null) p=col?this.table.permissions[table].columns[col].indexOf(k.charAt(0).toLowerCase())>-1:null;
                        if (p===null) p=id?this.table.permissions[table].items[id.toString()].indexOf(k.charAt(0).toLowerCase())>-1:null;
                        if (p===null) p=this.table.permissions[table].value.indexOf(k.charAt(0).toLowerCase())>-1;
                        v[k]=p;
                    });
                }

                return v[type];
            },
            inputCell(obj){
                $(obj.target).addClass('notsaved');
                this.inputSave(obj);
            },
            inputSelectChange(val){
                const cover = document.getElementById('inputSelect').parentElement.getElementsByTagName('span')[0];
                cover.style.display='inline';
                cover.innerText = this.inputSelectOptions.filter(i=>i.value===val)[0].text;
                $(cover).attr('data-value', val);
                $(cover).addClass('notsaved')
                this.inputSave(cover);
                this.inputSelectOptions = [];
                this.inputSelectedValue = null;
                document.getElementById('warehouse').appendChild(document.getElementById('inputSelect'))
            },
            inputSave: _.debounce(function(obj) {
                let eType = 'none';
                if(obj.target)obj=obj.target;
                if (obj.getAttribute('data-column') && this.table.shell.columns[obj.getAttribute('data-column')].editor ) eType = this.table.shell.columns[obj.getAttribute('data-column')].editor;
                const tab = this.table.name;
                const id = obj.getAttribute('data-key');
                const col = obj.getAttribute('data-column');
                let val = 'none'
                if (eType === 'string') val = obj.innerText;
                if (eType === 'selector') val = $(obj).attr('data-value');// parseFloat(obj.innerText); //<----------

                this.$store.dispatch('TABLES/UPDATE_VALUE', {table: tab, id: id, column: col, value: val, editor: eType}).then(r=>{
                    if(r.data.updated) {
                        //console.log(r.data);
                        $(obj).removeClass('notsaved');
                        this.$store.commit('TABLES/ADD_EVENT', r.data)
                    } else {
                        console.log(r)
                        Swal.fire({
                            title: 'Ошибка сохранения',
                            text:  r.data.updated,
                            type:  'error',
                            timer: 10000
                        });
                    }
                })
                    .catch(e=>{
                        Swal.fire({
                            title: 'Непредвиденная ошибка',
                            text:  e.response.data.message,
                            type:  'error',
                            timer: 10000
                        });
                    });

            }, 2000),
            opticsChanged(n,o){
                let isEqual = true;
                _.forEach(n._forCompare, v=>{
                    if(!_.isEqual(n[v], o[v])) isEqual = false;
                });
                return !isEqual;
            },
            optiTab(){
                //оптимизация визуализации талицы
                Vue.set(this, 'rowWidth', 0)
                this.calcTab();
            },
            reset(){
                _.forEach(this.table.shell.initial, (i,n)=>{
                    if(i.filters && !_.isEqual(this.table.shell.optics.filters[n], i.filters)) Vue.set(this.table.shell.optics.filters, n, _.cloneDeep(i.filters));
                    if(i.sortable && !_.isEqual(this.table.shell.optics.sorters[n], this.$store.getters['TABLES/GET_INITIAL_SORTER'])) Vue.set(this.table.shell.optics.sorters, n, this.$store.getters['TABLES/GET_INITIAL_SORTER']);
                });
            },
            rowReturn(id){
                this.table.data.filter(i=>i.id===id)[0] = _.cloneDeep(this.table.iData.filter(i=>i.id===id)[0]);
            },
            setOptics(n){
                if(n && (!this.oldOptics || this.opticsChanged(n,this.oldOptics))) {
                    this.oldOptics = _.cloneDeep(n);
                    this.oldOptics.table = this.table.name;
                    Vue.set(this, 'loadingStatus', this.enumLoadingStatus.TableLoading);
                }
            },
            setRowWidth(){
                let width = 70;
                Object.keys(this.table.shell.columns).map((k) => {
                    width += this.$refs.tab.querySelector(`div[data-header="${k}"]`).offsetWidth;
                });
                Vue.set(this, 'rowWidth', width)
            },
            tableSort(col, dir){
                Vue.set(this.table.shell.optics.sorters[col], 'value', dir);
                if (dir===null) {
                    Vue.set(this.table.shell.optics.sorters[col], 'order', null);
                } else {
                    if (this.table.shell.optics.sorters[col].order === null) {
                        Vue.set(this.table.shell.optics.sorters[col], 'order', 100);
                    }
                }
                let order = [];

                Object.keys(this.table.shell.optics.sorters).map((k)=>{
                    if(this.table.shell.optics.sorters[k].order!==null) order.push({old: this.table.shell.optics.sorters[k].order, new:0})
                });
                order.sort((a,b)=>{
                    if(a.old>b.old) {return 1}
                    if(a.old<b.old) {return -1}
                    return 0
                });

                order.forEach((f,i)=>{f.new=i+1});
                Object.keys(this.table.shell.optics.sorters).map((k)=>{
                    if(this.table.shell.optics.sorters[k].order!==null) {
                        const fO = order.find(e=>{return e.old===this.table.shell.optics.sorters[k].order})
                        Vue.set(this.table.shell.optics.sorters[k], 'order', fO.new);
                    }
                });
            },
            waitForTab(){
                if (this.$refs.tab && this.$refs.tab.querySelectorAll('.v-t-data-row').length == this.table.data.length){
                    this.calcTab();
                    Vue.set(this, 'loadingStatus', this.enumLoadingStatus.TableDisplayed);
                } else {
                    this.WFTcounter++;
                    if (this.WFTcounter<100) _.delay(this.waitForTab, 100); else console.log(`WFTcounter=${this.WFTcounter}`);
                }
            },
            zipup(obj, items){
                // типа actualOptics в tables.js
                let ret = _.cloneDeep(obj);
                ret.items = items;
                const nfs = _.cloneDeep(ret._notForRouter);
                Object.keys(ret).map(k=>{
                    if (nfs.includes(k)) delete ret[k];
                });
                return this.zipup2(ret)
            },
            zipup2(obj){
                if (_.isArray(obj)) {
                    _.remove(obj, (item)=>{
                        return item.value === null || item.value==='' || (_.isObject(item.value) &&_.isEmpty(item.value))
                    });

                    obj.forEach((item)=>{
                        if (_.isObject(item) || _.isArray(item)) {
                            item = this.zipup2(item)
                        }
                    });
                } else if (_.isObject(obj)) {

                    Object.keys(obj).map((k)=>{
                        if (k.charAt(0)==='_'){
                            delete obj[k];
                        } else if (_.isArray(obj[k])) {
                            obj[k] = this.zipup2(obj[k])
                            if(obj[k].length===0) delete obj[k];
                        } else if (_.isObject(obj[k])) {
                            if(obj[k].value==='' || (_.isObject(obj[k].value) &&_.isEmpty(obj[k].value))) {
                                delete obj[k];
                            } else {
                                obj[k] = this.zipup2(obj[k])
                                if(_.isEmpty(obj[k])) delete obj[k];
                            }
                        } else {
                            if (!obj[k]){
                                delete obj[k];
                            }
                        }
                    });
                }
                return obj
            },
        },
        created() {
            this.table = _.cloneDeep(this.$store.getters['TABLES/GET_INITIAL_TABLE']);
            Vue.set(this.table, 'name', this.$route.params.table);
            Vue.set(this.table, 'queryOptics', this.$route.query.optics);
            Vue.set(this, 'loadingStatus', this.userID ? this.enumLoadingStatus.Authenticated : this.enumLoadingStatus.Begin)
        },
        updated() {
            // titles for ellipses
            if (this.$refs.tab){
                this.$refs.tab.querySelectorAll('.h-c-text').forEach(col=>{
                    if(col.offsetWidth < col.scrollWidth){
                        col.setAttribute('title', col.textContent);
                    } else {
                        col.removeAttribute('title');
                    }
                });
            }
        },
        beforeRouteUpdate(to, from, next){
            if(this.table.name != to.params.table) {
                Vue.set(this, 'table',  _.cloneDeep(this.$store.getters['TABLES/GET_INITIAL_TABLE']));
                Vue.set(this.table, 'name', to.params.table);
                Vue.set(this, 'loadingStatus', this.userID ? this.enumLoadingStatus.Authenticated : this.enumLoadingStatus.Begin);
                this.oldOptics = null;
            }
            next();
        },
        watch:{
            'table.shell.basket': {
                handler: function (n) {
                    if (n && n.length>0 && !_.isEqual(_.last(this.queueSave).basket, n)) this.queueSave.push(this.table.shell)
                },
                deep: true
            },
            'table.shell.optics': {
                handler: function (n) {
                    if (n){
                        if(this.loadingStatus>this.enumLoadingStatus.ShellLoaded &&
                            this.$store.getters['TABLES/GET_CACHE_ITEM'](this.table) &&
                            !_.isEqual(_.last(this.queueSave).optics, n))
                        {
                            this.queueSave.push(_.cloneDeep(this.table.shell));
                            this.setOptics(n);
                        } else if (this.loadingStatus>this.enumLoadingStatus.ShellLoaded &&
                            !_.isEqual(_.last(this.queueSave).optics, n))
                        {
                            this.shading = true;
                            this.queueSave.push(_.cloneDeep(this.table.shell));
                            this.delayedSetOptics(n);
                        } else if (this.loadingStatus===this.enumLoadingStatus.ShellLoaded &&
                            _.isEqual(_.last(this.queueSave).optics, n))
                        {
                            this.setOptics(n);
                        }

                    }
                },
                deep: true
            },
            'table.shell.columns': {
                handler: function (n) {
                    if(n && !_.isEqual(_.last(this.queueSave.columns, n))) this.queueSave.push(this.table.shell)
                },
                deep: true
            },
            loadingStatus(n){
                if (n===this.enumLoadingStatus.Begin){
                } else if (n===this.enumLoadingStatus.Authenticated){
                    this.$store.dispatch('TABLES/SET_SHELL', _.cloneDeep(this.table));
                } else if (n===this.enumLoadingStatus.ShellLoaded) {
                    this.queueSave=[_.cloneDeep(this.SHELL)];
                    Vue.set(this.table, 'shell', _.cloneDeep(this.SHELL));
                    Vue.set(this.table, 'queryOptics', null);
                } else if (n===this.enumLoadingStatus.TableLoading) {
                    this.$store.dispatch('TABLES/LOAD_PAGE', _.cloneDeep(this.table));
                } else if (n===this.enumLoadingStatus.TableLoaded) {
                    this.shading = false;
                    let items=[];
                    this.table.data.forEach(item=>{
                        items.push(item.id);
                    });
                    const optics = this.zipup(_.cloneDeep(this.table.shell.optics), items);
                    Vue.set(this.table.shell.optics, 'items', items)
                    Vue.set(this.table, 'queryOptics', optics);

                    const jOptics = JSON.stringify(optics);
                    if (this.$route.query.optics!==jOptics) this.$router.push({query: {optics: jOptics}});
                    Vue.set(this, 'loadingStatus', this.enumLoadingStatus.TablePreDisplayed);
                } else if (n===this.enumLoadingStatus.TablePreDisplayed) {
                    if (!this.table.shell.optics._visualOptimized) {
                        this.waitForTab();
                    } else {
                        Vue.set(this, 'loadingStatus', this.enumLoadingStatus.TableDisplayed);
                    }
                } else if (n===this.enumLoadingStatus.TableDisplayed) {
                    //this.headerHeight = this.$refs.tab.querySelector('.v-t-header').offsetHeight;
                    this.table.shell.optics._visualOptimized = true;
                    //this.displayedToSaved();
                } else if (n===this.enumLoadingStatus.TableSaved) {
                    // this.oldColumns = _.cloneDeep(this.table.shell.columns)
                }
            },
            cacheFromOptics(n){
                if(n){
                    Vue.set(this.table, 'data', n.response.rows);
                    Vue.set(this.table, 'permissions', n.response.permissions);
                    Vue.set(this.table, 'iData', _.cloneDeep(n.response.rows));
                    Vue.set(this.table.shell.optics, 'pages', n.response.pages);
                    const pageSize = n.response.pageSize;
                    if (this.table.shell.optics.pageSize !== pageSize) Vue.set(this.table.shell.optics, 'pageSize', pageSize);

                    Vue.set(this, 'loadingStatus', this.enumLoadingStatus.TableLoaded);
                }
            },
            lastEvent(n){
                console.log(n);
            },
            queueSave: _.debounce(function(n){
                if (n.length>1 && this.loadingStatus>=this.enumLoadingStatus.TableDisplayed){
                    if(!_.isEqual(_.first(this.queueSave), _.last(this.queueSave))) this.$store.dispatch('TABLES/UPDATE_SHELL', _.last(this.queueSave));
                    this.queueSave.unshift(this.queueSave.splice(-1,1));
                    this.queueSave.splice(1, this.queueSave.length-1);
                    Vue.set(this, 'loadingStatus', this.enumLoadingStatus.TableSaved);
                }
            },2000),
            SHELL(n,o){
                // проверка на инициализирующие изменения шелла в сторе
                if(n && n.assembled && (!o.assembled || n.table!==o.table)) Vue.set(this, 'loadingStatus', this.enumLoadingStatus.ShellLoaded);
            },
            userID(n){
                if(n)  Vue.set(this, 'loadingStatus', this.enumLoadingStatus.Authenticated);
            },
        }
    }

</script>

<!--suppress CssInvalidPseudoSelector -->
<style lang="scss" scoped>
    .transp{opacity: 0}
    .tran05{opacity: 0.5}
    .v-table {
        display: flex;
        flex-flow: column;
        overflow: auto;
        min-height: 400px;
        position: relative;
    }
    .v-t-loader {
        background-color: #f0f0f0;
        opacity: 0.4;
        z-index: 999;
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
    }
    .v-t-l-spinner {
        width: 160px;
        height: 160px;
        margin: auto;
    }
    .v-t-header {color: white; background-color: #455fc2; margin-bottom: 5px;}
    .v-t-header
    , .v-t-row
    , .v-t-data-row {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        flex-wrap: nowrap;
        height: auto;
    }
    .v-t-data-row{
        .v-t-col{
            span{padding: 3px;}
        }
    }
    .v-t-data-row:hover{background-color: #f6f6f6}
    .v-t-data-row-changed{
        background-color: #cccccc;
        border-radius: 5px;
    }
    .v-t-col {
        flex-basis: 0;
        flex-grow: 1;
        max-width: 100%;
        height: 100%;
        padding-left: 10px;
        span{transition: 0.5s;}
        span.link:not([contenteditable=true]){color:navy; text-decoration: underline; cursor: pointer}
        span[contenteditable=true] {display: block}
        .notsaved{outline-color: #ff9999; outline-style: auto;}
        .custom-select{padding: 2px 2px 2px 5px; height: 30px;}
    }
    .v-data-span {display:flex; align-items:center;  min-height: 40px;}

    .h-c-text {overflow: hidden; white-space: nowrap; text-overflow: ellipsis;}
    .h-c-tools {
        margin-left: auto;
        span {display: inline-block}
        max-width: 30px; min-width: 30px;
    }
    .h-c-drag {
        cursor: move;  opacity: 0.5; margin-right: 2px;
        :hover {opacity: 1}
    }
    .h-c-sizing {
        min-width: 5px; cursor: col-resize; opacity: 0.5;
        :hover {opacity: 1}
    }
    .h-c-options { &::v-deep .btn {padding: 2px !important;} }
    .p-options {}
</style>
