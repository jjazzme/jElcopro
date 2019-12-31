<template>
    <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
    <div
        :class="`${value.loadingStatus===enums.loadingStatus.TableLoading?'tran05':''} v-t-header`"
        :style="headerRowStyle"
        v-if="value.loadingStatus>=enums.loadingStatus.TableLoading"
    >
        <!--ЗАГОЛОВОК ТАБЛИЦЫ-->
        <div
            class="v-t-col text-center p-0 m-0"
            style="min-width: 70px; max-width: 70px; order:-1000000"
        >
            <!--ПЕРВАЯ ЯЧЕЙКА ЗАГОЛОВКА-->
            <b-form-checkbox
                v-model="value.showBasket"
                :disabled="value.table.shell.basket.length===0"
                name="check-button"
                button
                size="sm"
                :button-variant="value.table.shell.basket.length===0?'outline-light':'outline-warning'"
            >{{value.table.shell.basket.length}}</b-form-checkbox>
            <b-dropdown
                text=""
                :variant="tableOptionsIsInitial?'outline-light':'outline-warning'"
                size="sm"
                title="Опции таблицы"
                class=""
            >
                <b-form-checkbox
                    v-for="(i,k) in value.table.shell.columns"
                    v-if="i.hidden!==true"
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
                v-for="(v, k, i) in value.table.shell.columns"
                v-show="value.table.shell.columns[k].show"
                class="v-t-col"
                :key="i"
                :style="parent.style[k]"
                :data-header="k"
                :data-index="value.table.shell.columns[k].order"
                :data-index-main="value.table.shell.columns[k].order"
                @dragover="dragover"
                @dragleave="dragleave"

        >
            <div
                v-if="value.table.shell.columns[k].hidden !== true"
                class="v-t-row"
                :data-index="value.table.shell.columns[k].order"
            >
                <span
                    class="h-c-text"
                    :data-index="value.table.shell.columns[k].order"
                >
                    {{v.label}}
                </span>
                <span
                    class="h-c-tools"
                    :data-index="value.table.shell.columns[k].order"
                >
                    <b-dropdown
                        :variant="columnsOptionsVariant[k] ? 'outline-light' : 'outline-warning'"
                        size="sm"
                        no-caret
                        class="h-c-options"
                    >
                        <template slot="button-content">
                            <span
                                class="h-c-drag sm position-relative"
                                :class="`${!value.table.shell.optics.sorters[k].value ? 'fas fa-bars' : value.table.shell.optics.sorters[k].value === 'asc' ? 'fas fa-sort-alpha-down' : 'fas fa-sort-alpha-up-alt'}`"
                                @dragstart="dragChangeStart"
                                @dragend="dragChangeEnd"
                                draggable="true"
                                :data-index="value.table.shell.columns[k].order"
                            >
                                <span
                                    class="position-absolute"
                                    style="top:-2px; left: -10px; color: white; font-size: 10px"
                                >{{value.table.shell.optics.sorters[k].order === null ? '' : value.table.shell.optics.sorters[k].order}}</span>
                            </span>
                        </template>
                        <b-dropdown-group
                            v-if="value.table.shell.columns[k].sortable"
                        >
                            <b-dropdown-item
                                @click="tableSort(k, 'asc')"
                                :disabled="value.table.shell.optics.sorters[k].value ==='asc'"
                            >
                                Сортировать А...Я <i class="fas fa-sort-alpha-down"></i>
                            </b-dropdown-item>
                            <b-dropdown-item
                                @click="tableSort(k, 'desc')"
                                :disabled="value.table.shell.optics.sorters[k].value ==='desc'"
                            >
                                Сортировать Я...А <i class="fas fa-sort-alpha-up-alt"></i>
                            </b-dropdown-item>
                            <b-dropdown-item
                                @click="tableSort(k, null)"
                                :disabled="!value.table.shell.optics.sorters[k].value"
                            >
                                Не сортировать
                            </b-dropdown-item>
                        </b-dropdown-group>
                        <b-dropdown-group

                        >
                            <filters
                                v-if="value.table.shell.optics.filters[k]"
                                v-model="value.table.shell.optics.filters[k]"
                            ></filters>
                        </b-dropdown-group>
                        <b-dropdown-item
                                @click="value.table.shell.columns[k].show=false"
                                variant="danger"
                        >Скрыть</b-dropdown-item>
                    </b-dropdown>
    <!--i class="h-c-drag fas fa-grip-vertical"></i-->
                    <span
                            :data-index="value.table.shell.columns[k].order"
                            class="fa fa-ellipsis-v h-c-sizing"
                            @dragstart="dragResizeStart"
                            @drag="dragResize"
                            draggable="true"
                    ></span>
                </span>
            </div>
        </div>
    </div>
</template>

<script>

    import filters from "./filters";
    import Enums from '../../../modules/enums'
    import Vue from 'vue'

    export default {
        name: "modelHeader",
        components: {
            filters
        },
        props: {
            value: null
        },
        data() {
            return {
                enums: new Enums(),
                drag:{before:0, column:null, from:0, startObjWidth:0, startX: 0},
                headerHeight: 30,
            }
        },
        computed:{
            columnsOptionsVariant(){
                let ret = {}
                Object.keys(this.value.table.shell.columns).map((k)=>{
                    ret[k] = _.isEqual(this.value.table.shell.optics.filters[k], this.value.table.shell.initial[k].filters)
                    if (this.value.table.shell.initial[k].sortable) {
                        ret[k] = ret[k] && _.isEqual(this.value.table.shell.optics.sorters[k], this.$store.getters['TABLES/GET_INITIAL_SORTER'])
                    }
                });
                return  ret;
            },
            headerRowStyle(){return `${this.value.rowWidth===0 ? 'width: auto' : `width: auto; height: ${this.headerHeight}px;` };`},
            tableOptionsIsInitial(){
                let ret = true;
                _.forEach(this.value.table.shell.columns, i=>{
                    if (i.hidden!==true && i.show===false) ret=false;
                });
                return ret;
            },
        },
        methods:{
            dragChangeEnd(){
                Object.keys(this.value.table.shell.columns).map((k)=>{
                    if(this.value.table.shell.columns[k].order===this.drag.from) {this.value.table.shell.columns[k].order=this.drag.before-1}
                    else if(this.value.table.shell.columns[k].order<this.drag.before) this.value.table.shell.columns[k].order--
                });
            },
            dragChangeStart(evt){
                this.drag.from = parseInt(evt.targetElement.getAttribute('data-index'));
                this.drag.column = this.parent.$refs.tab.querySelector(`div[data-index-main="${this.drag.from}"]`).getAttribute("data-header");
            },
            dragleave(evt){
                let dbe = evt.targetElement;
                while (!dbe.getAttribute('data-index')) {
                    dbe = dbe.parentElement;
                }
                let dragBefore = parseInt(dbe.getAttribute('data-index'));
                const mainDragOver = this.parent.$refs.tab.querySelector(`div[data-index-main="${dragBefore}"]`);
                mainDragOver.style.background = '';
            },
            dragover(evt){
                let dbe = evt.targetElement;
                while (!dbe.getAttribute('data-index')) {
                    dbe = dbe.parentElement;
                }

                this.drag.before = parseInt(dbe.getAttribute('data-index'));
                const mainDragOver = this.parent.$refs.tab.querySelector(`div[data-index-main="${this.drag.before}"]`);
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
                this.drag.column = evt.targetElement.parentElement.parentElement.parentElement.getAttribute('data-header');
                this.drag.startObjWidth = evt.targetElement.parentElement.parentElement.parentElement.offsetWidth;
            },
            dragResize: _.throttle(function(evt){
                if(evt.clientX !== 0)
                {
                    let width = this.drag.startObjWidth + evt.clientX - this.drag.startX;
                    if(width<60) width=60;
                    Vue.set(this.value.table.shell.columns[this.drag.column], 'style', `min-width: ${width}px; max-width: ${width}px;`);
                    this.setRowWidth();
                }
            }, 200),
            optiTab(){
                //оптимизация визуализации талицы
                Vue.set(this.value, 'rowWidth', 0)
                this.parent.calcTab();
            },
            reset(){
                _.forEach(this.value.table.shell.initial, (i,n)=>{
                    if(i.filters && !_.isEqual(this.value.table.shell.optics.filters[n], i.filters)) Vue.set(this.value.table.shell.optics.filters, n, _.cloneDeep(i.filters));
                    if(i.sortable && !_.isEqual(this.value.table.shell.optics.sorters[n], this.$store.getters['TABLES/GET_INITIAL_SORTER'])) Vue.set(this.value.table.shell.optics.sorters, n, this.$store.getters['TABLES/GET_INITIAL_SORTER']);
                });
            },
            tableSort(col, dir){
                Vue.set(this.value.table.shell.optics.sorters[col], 'value', dir);
                if (dir===null) {
                    Vue.set(this.value.table.shell.optics.sorters[col], 'order', null);
                } else {
                    if (this.value.table.shell.optics.sorters[col].order === null) {
                        Vue.set(this.value.table.shell.optics.sorters[col], 'order', 100);
                    }
                }
                let order = [];

                Object.keys(this.value.table.shell.optics.sorters).map((k)=>{
                    if(this.value.table.shell.optics.sorters[k].order!==null) order.push({old: this.value.table.shell.optics.sorters[k].order, new:0})
                });
                order.sort((a,b)=>{
                    if(a.old>b.old) {return 1}
                    if(a.old<b.old) {return -1}
                    return 0
                });

                order.forEach((f,i)=>{f.new=i+1});
                Object.keys(this.value.table.shell.optics.sorters).map((k)=>{
                    if(this.value.table.shell.optics.sorters[k].order!==null) {
                        const fO = order.find(e=>{return e.old===this.value.table.shell.optics.sorters[k].order})
                        Vue.set(this.value.table.shell.optics.sorters[k], 'order', fO.new);
                    }
                });
            },
        },
    }
</script>

<style scoped>

</style>