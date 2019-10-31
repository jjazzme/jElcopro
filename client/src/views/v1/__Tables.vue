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

            <!--ЗАГОЛОВОК ТАБЛИЦЫ-->
            <div
                :class="`${loadingStatus===enums.loadingStatus.TableLoading?'tran05':''} v-t-header`"
                :style="headerRowStyle"
                v-if="loadingStatus>=enums.loadingStatus.TableLoading"
            >
                <!--ПЕРВАЯ ЯЧЕЙКА ЗАГОЛОВКА-->
                <div
                    class="v-t-col text-center p-0 m-0"
                    style="min-width: 70px; max-width: 70px; order:-1000000"
                >
                    <!-- выбор баскета -->
                    <b-form-checkbox
                        v-model="showBasket"
                        :disabled="table.shell.basket.length===0"
                        name="check-button"
                        button
                        size="sm"
                        :button-variant="table.shell.basket.length===0?'outline-light':'outline-warning'"
                    >{{table.shell.basket.length}}</b-form-checkbox>

                    <!-- опции таблицы  -->
                    <b-dropdown
                        text=""
                        :variant="tableOptionsIsInitial?'outline-light':'outline-warning'"
                        size="sm"
                        title="Опции таблицы"
                        class=""
                    >
                        <b-form-checkbox
                            v-if="i.hidden!==true"
                            v-for="(i,k) in table.shell.columns"
                            class="text-nowrap mx-2"
                            :key="k"
                            v-model="i.show"
                        >{{i.label}}</b-form-checkbox>

                        <b-button
                            @click="optiTab"
                            variant="link"
                            class="text-nowrap"
                        >Оптимизировать вид</b-button>
                        <b-button
                            @click="reset"
                            variant="link"
                            class="text-nowrap"
                        >Сбросить фильтры</b-button>
                        <b-button
                                @click="addItem"
                                variant="link"
                                class="text-nowrap"
                        >Добавить запись</b-button>
                    </b-dropdown>
                </div>

                <!-- поля заголовка -->
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
                        <!-- label -->
                        <span
                            class="h-c-text"
                            :data-index="table.shell.columns[k].order"
                        >
                            {{v.label}}
                        </span>

                        <!-- утилиты столбца -->
                        <span
                            class="h-c-tools"
                            :data-index="table.shell.columns[k].order"
                        >
                            <b-dropdown
                                :variant="columnsOptionsVariant[k] ? 'outline-light' : 'outline-warning'"
                                size="sm"
                                no-caret
                                class="h-c-options"
                            >
                                <template slot="button-content">
                                    <span
                                        class="h-c-drag sm"
                                        @dragstart="dragChangeStart"
                                        @dragend="dragChangeEnd"
                                        draggable="true"
                                        :data-index="table.shell.columns[k].order"
                                    >
                                        <span>
                                            <fa-icon :icon="
                                                !table.shell.optics.sorters[k].value ? 'bars'
                                                : table.shell.optics.sorters[k].value === 'asc' ? 'sort-alpha-down'
                                                : 'sort-alpha-up-alt'
                                            " />
                                        </span>
                                        <span v-if="table.shell.optics.sorters[k].order">
                                            {{!table.shell.optics.sorters[k].order?'':table.shell.optics.sorters[k].order}}
                                        </span>
                                    </span>
                                </template>
                                <b-dropdown-group
                                        v-if="table.shell.columns[k].sortable"
                                >
                                    <b-dropdown-item
                                            @click="tableSort(k, 'asc')"
                                            :disabled="table.shell.optics.sorters[k].value ==='asc'"
                                    >
                                        Сортировать А...Я
                                        <fa-icon icon="sort-alpha-down" />
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                            @click="tableSort(k, 'desc')"
                                            :disabled="table.shell.optics.sorters[k].value ==='desc'"
                                    >
                                        Сортировать Я...А
                                        <fa-icon icon="sort-alpha-up-alt" />
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
                                </b-dropdown-group>
                                <b-dropdown-item
                                        @click="table.shell.columns[k].show=false"
                                        variant="danger"
                                >Скрыть</b-dropdown-item>
                            </b-dropdown>
                            <!--i class="h-c-drag fas fa-grip-vertical"></i-->
                            <span
                                    :data-index="table.shell.columns[k].order"
                                    class="h-c-sizing"
                                    @dragstart="dragResizeStart"
                                    @drag="dragResize"
                                    draggable="true"
                            >
                                <fa-icon icon="ellipsis-v"/>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            <!--БОДИ ТАБЛИЦЫ-->
            <div
                    :class="shading?'tran05':''"
            >
                <div
                    :style="rowStyle"
                    v-for="(row, i1) in tableData"
                    class="v-t-data-row"
                    :key="i1"
                    :data-id="row.id"
                >
                    <!--ПЕРВАЯ ЯЧЕЙКА СТРОКИ-->
                    <div
                        class="v-t-col text-center"
                        style="min-width: 70px; max-width: 70px; order:-1000000"
                        :data-id="`t_ch_${row.id}`"
                    >
                        <b-form-checkbox
                                size="sm"
                                class="d-inline-block pl-4 pr-0"
                                :key="`t_ch_${row.id}`"
                                @change="basketChange(row.id)"
                                :checked="table.shell.basket.filter(i=>{return i.id===row.id}).length>0"
                        ></b-form-checkbox>
                        <b-dropdown
                                text=""
                                :variant="`${dataChanged[row.id]._row ? 'outline-warning' : 'outline-dark'}`"
                                size="sm"
                        >
                            <b-dropdown-item
                                    v-if="dataChanged[row.id]._row"
                                    variant="varning"
                                    @click="rowReturn(row.id)"
                            >До редактирования</b-dropdown-item>
                            <b-dropdown-item
                                    v-if="getPermission(enums.permission.Update, row.id)"
                            >
                                <router-link
                                        :to="{name:'modelItem', params: {table: table.name, id:row.id}}"
                                        class="fa fa-pencil-square text-capitalize"
                                > {{$store.getters['TABLES/GET_SHELL'](table.name).name.one}}: карточка</router-link>
                            </b-dropdown-item>

                        </b-dropdown>
                    </div>
                    <div
                            @contextmenu="editClick"
                            v-for="(v2, k2) in row"
                            :key="k2"
                            :class="`v-t-col my-auto ${dataChanged[row.id][k2] ? 'dataChanged' : ''}`"
                            :style="style[k2]"
                            :data-column="k2"
                            v-show="table.shell.columns[k2].show"
                            v-if="table.shell.columns[k2].hidden !== true"
                    >
                            <span
                                    @focusout="focusOutCell"
                                    @input="inputCell"
                                    @click="clickCell"

                                    :data-column="k2"
                                    :data-key="row.id"
                                    :class="`${table.shell.columns[k2].parentClass?table.shell.columns[k2].parentClass:''} ${table.shell.columns[k2].to?'link':''}`"
                                    v-html="v2"></span>
                    </div>
                </div>
            </div>

        </div>

    </article>
</template>

<script>
    import Vue from 'vue'


    export default {
        name: "vTable",


        created() {
            debugger
            this.table = _.cloneDeep(this.$store.getters['TABLES/GET_INITIAL_TABLE']);
            Vue.set(this.table, 'name', this.$route.params.table);
            Vue.set(this.table, 'queryOptics', this.$route.query.optics);
            Vue.set(this, 'loadingStatus', this.userID ? this.enums.loadingStatus.Authenticated : this.enums.loadingStatus.Begin)
        },

    }
</script>

<!--suppress CssInvalidPseudoSelector -->
<style lang="scss" scoped>
    .transp{opacity: 0}
    .tran05{opacity: 0.5}
</style>
