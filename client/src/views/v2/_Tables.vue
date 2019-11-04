<template>
    <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
    <article>
        <div v-if="loadingStatus<=enums.loadingStatus.TableLoading" class="v-t-loader">
            <!--СПИННЕР-->
            <b-spinner class="v-t-l-spinner" variant="warning" label="Загрузка..." />
        </div>
        <div
                class="v-table"
                ref="tab"
        >
            <!-- ВСЯ ТАБЛИЦА -->
            <paginator
                    :class="`${loadingStatus<enums.loadingStatus.TableLoaded?'transp':''} text-center`"
                    v-model="table.shell.optics"
            ></paginator>

            <model-header
                    v-model="subModel"

            ></model-header>

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
                                    v-if="getPermission(enums.permission.Update, row.id)"
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
                    :class="`${loadingStatus<enums.loadingStatus.TableLoaded?'transp':''} text-center`"
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
    import paginator from '../../components/tables/v1/paginator';
    import modelHeader from '../../components/tables/v1/header';
    import Swal from 'sweetalert2';

    import Enums from '../../modules/enums'

    export default {
        name: "vTable",
        components: {
            paginator,
            modelHeader
        },
        data() {
            return {
                enums: new Enums(),
                inputSelectedValue: null,
                inputSelectOptions: [],
                loadingStatus: -10,
                oldOptics: null,
                queueSave:[],
                rowWidth: 0,
                shading: false,
                showBasket: false,
                subModel: null,
                table: null,
                WFTcounter: -1,
            }
        },
        computed:{
            // main
            cacheFromOptics(){return this.loadingStatus === this.enums.loadingStatus.TableLoading ? this.$store.getters['TABLES/GET_CACHE_ITEM']('model', this.table.name, this.table.shell.optics) : null;},
            lastEvent(){return this.$store.getters['TABLES/GET_LAST_EVENT']},
            SHELL(){return this.$store.getters['TABLES/GET_SHELL'](this.table?.name)},
            tableData: {
                get(){
                    let sou = [];
                    if (this.showBasket){
                        sou = this.table.shell.basket;
                    } else if (this.loadingStatus >= this.enums.loadingStatus.TableLoaded) {
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
                },
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


            editClick(e){
                e.preventDefault();
                const obj = $($(e.target).closest('div.v-t-col')[0]).find('>span')[0];

                const id = obj.getAttribute('data-key');
                const col = obj.getAttribute('data-column');
                if(this.getPermission(this.enums.permission.Update, id, col )){
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
                // eslint-disable-next-line no-console
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
                        // eslint-disable-next-line no-console
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
            rowReturn(id){
                this.table.data.filter(i=>i.id===id)[0] = _.cloneDeep(this.table.iData.filter(i=>i.id===id)[0]);
            },
            setOptics(n){
                if(n && (!this.oldOptics || this.opticsChanged(n,this.oldOptics))) {
                    this.oldOptics = _.cloneDeep(n);
                    this.oldOptics.table = this.table.name;
                    Vue.set(this, 'loadingStatus', this.enums.loadingStatus.TableLoading);
                }
            },
            setRowWidth(){
                let width = 70;
                Object.keys(this.table.shell.columns).map((k) => {
                    width += this.$refs.tab.querySelector(`div[data-header="${k}"]`).offsetWidth;
                });
                Vue.set(this, 'rowWidth', width)
            },
            waitForTab(){
                if (this.$refs.tab && this.$refs.tab.querySelectorAll('.v-t-data-row').length == this.table.data.length){
                    this.calcTab();
                    Vue.set(this, 'loadingStatus', this.enums.loadingStatus.TableDisplayed);
                } else {
                    this.WFTcounter++;
                    // eslint-disable-next-line no-console
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
            Vue.set(this, 'loadingStatus', this.userID ? this.enums.loadingStatus.Authenticated : this.enums.loadingStatus.Begin)

            this.subModel = {
                loadingStatus: this.loadingStatus,
                rowWidth: this.rowWidth,
                showBasket: this.showBasket,
                table: this.table,
            };
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
                Vue.set(this, 'loadingStatus', this.userID ? this.enums.loadingStatus.Authenticated : this.enums.loadingStatus.Begin);
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
                        if(this.loadingStatus>this.enums.loadingStatus.ShellLoaded &&
                            this.$store.getters['TABLES/GET_CACHE_ITEM']('model', this.table.name, this.table.shell.optics) &&
                            !_.isEqual(_.last(this.queueSave).optics, n))
                        {
                            this.queueSave.push(_.cloneDeep(this.table.shell));
                            this.setOptics(n);
                        } else if (this.loadingStatus>this.enums.loadingStatus.ShellLoaded &&
                            !_.isEqual(_.last(this.queueSave).optics, n))
                        {
                            this.shading = true;
                            this.queueSave.push(_.cloneDeep(this.table.shell));
                            this.delayedSetOptics(n);
                        } else if (this.loadingStatus===this.enums.loadingStatus.ShellLoaded &&
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
                // eslint-disable-next-line no-empty
                if (n===this.enums.loadingStatus.Begin){
                } else if (n===this.enums.loadingStatus.Authenticated){
                    this.$store.dispatch('TABLES/SET_SHELL', _.cloneDeep(this.table));
                } else if (n===this.enums.loadingStatus.ShellLoaded) {
                    this.queueSave=[_.cloneDeep(this.SHELL)];
                    Vue.set(this.table, 'shell', _.cloneDeep(this.SHELL));
                    Vue.set(this.table, 'queryOptics', null);
                } else if (n===this.enums.loadingStatus.TableLoading) {
                    this.$store.dispatch('TABLES/LOAD_PAGE', _.cloneDeep(this.table));
                } else if (n===this.enums.loadingStatus.TableLoaded) {
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
                    Vue.set(this, 'loadingStatus', this.enums.loadingStatus.TablePreDisplayed);
                } else if (n===this.enums.loadingStatus.TablePreDisplayed) {
                    if (!this.table.shell.optics._visualOptimized) {
                        this.waitForTab();
                    } else {
                        Vue.set(this, 'loadingStatus', this.enums.loadingStatus.TableDisplayed);
                    }
                } else if (n===this.enums.loadingStatus.TableDisplayed) {
                    //this.headerHeight = this.$refs.tab.querySelector('.v-t-header').offsetHeight;
                    this.table.shell.optics._visualOptimized = true;
                    //this.displayedToSaved();
                } else if (n===this.enums.loadingStatus.TableSaved) {
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

                    Vue.set(this, 'loadingStatus', this.enums.loadingStatus.TableLoaded);
                }
            },
            lastEvent(n){
                // eslint-disable-next-line no-console
                console.log(n);
            },
            queueSave: _.debounce(function(n){
                if (n.length>1 && this.loadingStatus>=this.enums.loadingStatus.TableDisplayed){
                    if(!_.isEqual(_.first(this.queueSave), _.last(this.queueSave))) this.$store.dispatch('TABLES/UPDATE_SHELL', _.last(this.queueSave));
                    this.queueSave.unshift(this.queueSave.splice(-1,1));
                    this.queueSave.splice(1, this.queueSave.length-1);
                    Vue.set(this, 'loadingStatus', this.enums.loadingStatus.TableSaved);
                }
            },2000),
            SHELL(n,o){
                // проверка на инициализирующие изменения шелла в сторе
                if(n && n.assembled && (!o.assembled || n.table!==o.table)) Vue.set(this, 'loadingStatus', this.enums.loadingStatus.ShellLoaded);
            },
            userID(n){
                if(n)  Vue.set(this, 'loadingStatus', this.enums.loadingStatus.Authenticated);
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
