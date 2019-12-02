<template>
  <div
    class="v-t-header"
    :style="rowStyle"
    ref="header"
    v-if="value && value.shells.assembled"
  >
    <!--ПЕРВАЯ ЯЧЕЙКА ЗАГОЛОВКА-->
    <div
      class="v-t-col text-center p-0 m-0"
      style="min-width: 70px; max-width: 70px; order:-1000000"
    >
      <!-- выбор баскета -->
      <b-form-checkbox
        v-model="value.basket.show"
        :disabled="value.basket.value.length===0"
        name="check-button"
        button
        size="sm"
        :button-variant="value.basket.value.length===0?'outline-light':'outline-warning'"
      >{{value.basket.value.length}}</b-form-checkbox>

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
          v-for="(i,k) in value.shells.value"
          class="text-nowrap mx-2"
          :key="k"
          v-model="i.show"
        >{{i.label}}</b-form-checkbox>

        <b-button
          @click="value.tableOptimization(40)"
          variant="link"
          class="text-nowrap"
        >Оптимизировать вид</b-button>
        <b-button
          @click="value.reset()"
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
      v-for="(v, k, i) in value.shells.value"
      v-show="value.shells.value[k].show"
      class="v-t-col"
      :key="i"
      :style="value.style[k]"
      :data-column="k"
      :data-index="value.shells.value[k].order"
      :data-index-main="value.shells.value[k].order"
      @dragover="dragOver"
      @dragleave="dragLeave"
    >
      <div
        v-if="value.shells.value[k].hidden !== true"
        class="v-t-row"
        :data-index="value.shells.value[k].order"
      >
        <!-- label -->
        <span
          class="h-c-text"
          :data-index="value.shells.value[k].order"
        >
          {{v.label}}
        </span>

        <!-- утилиты столбца -->
        <span
          class="h-c-tools"
          :data-index="value.shells.value[k].order"
        >
          <b-dropdown
            :variant="value.columnsOptionsChanged[k] ? 'outline-warning' : 'outline-light'"
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
                :data-index="value.shells.value[k].order"
              >
                <span v-if="value.optics.value.sorters[k]">
                  <fa-icon :icon="
                    !value.optics.value.sorters[k].value ? 'bars'
                    : value.optics.value.sorters[k].value === 'asc' ? 'sort-alpha-down'
                    : 'sort-alpha-up-alt'
                  " />
                </span>
                <span v-if="value.optics.value.sorters[k] && value.optics.value.sorters[k].order">
                  {{!value.optics.value.sorters[k].order ? '' : value.optics.value.sorters[k].order}}
                </span>
              </span>
            </template>
            <b-dropdown-group
              v-if="value.shells.value[k].sortable"
            >
              <b-dropdown-item
                @click="value.tableSort(k, 'asc')"
                :disabled="!value.optics.value.sorters[k] || value.optics.value.sorters[k].value ==='asc'"
              >
                Сортировать А...Я
                <fa-icon icon="sort-alpha-down" />
              </b-dropdown-item>
              <b-dropdown-item
                @click="value.tableSort(k, 'desc')"
                :disabled="!value.optics.value.sorters[k] || value.optics.value.sorters[k].value ==='desc'"
              >
                Сортировать Я...А
                <fa-icon icon="sort-alpha-up-alt" />
              </b-dropdown-item>
              <b-dropdown-item
                @click="value.tableSort(k, null)"
                :disabled="!value.optics.value.sorters[k] || !value.optics.value.sorters[k].value"
              >
                Не сортировать
              </b-dropdown-item>
          </b-dropdown-group>
            <b-dropdown-group>
            <filters
              v-if="value.optics.value.filters[k]"
              v-model="value.optics.value.filters[k]"
            ></filters>
            </b-dropdown-group>
            <b-dropdown-item
              @click="value.shells.value[k].show=false"
              variant="danger"
            >Скрыть</b-dropdown-item>
          </b-dropdown>

          <span
            :data-index="value.shells.value[k].order"
            class="h-c-sizing"
            @dragstart="dragResizeStart"
            @drag="dragResize"
            @dragend="dragResizeEnd"
            draggable="true"
          >
              <fa-icon icon="ellipsis-v"/>
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  import TableSource from "../../../../classLib/TableSource";
  import filters from "./tableHeader/filters";

  export default {
    name: "tableHeader",
    components: {filters},
    props: {
      value: null
    },
    computed:{
      shellAssembled(){ return this.value && this.value.shells.assembled; },
      rowStyle(){
        if (!this.value) return null;
        return `${this.value.shells.width===0 ? 'width: auto' : `width: auto; height: ${this.value.shells.headerHeight}px;` };`},
      /*
      style() {
        let ret = {};
        Object.keys(this.value.shells.value).map((k)=>{
          ret[k] = `order: ${this.value.shells.value[k].order}; ${this.value.shells.value[k].style}`
        });
        return ret;
      },
       */
      tableOptionsIsInitial(){
        _.forEach(this.value.shells.value, i=>{
          if (i.hidden!==true && i.show===false) return false;
        });
        return true;
      },
    },
    methods:{
      addItem(){
console.log('add')
      },

      dragChangeEnd(){
        this.value.drag.action = null;
        Object.keys(this.value.shells.value).map((k)=>{
          if(this.value.shells.value[k].order===this.value.drag.from) {this.value.shells.value[k].order=this.value.drag.before-1}
          else if(this.value.shells.value[k].order<this.value.drag.before) this.value.shells.value[k].order--
        });
      },
      dragChangeStart(evt){
        this.value.drag.action = 'toggle';
        this.value.drag.from = parseInt(evt.target.getAttribute('data-index'));
        this.value.drag.column = this.value.htmlObject.querySelector(`div[data-index-main="${this.value.drag.from}"]`).getAttribute("data-column");
      },
      dragLeave(evt){
        let dbe = evt.target;
        while (!dbe.getAttribute('data-index')) {
          dbe = dbe.parentElement;
        }
        let dragBefore = parseInt(dbe.getAttribute('data-index'));
        const mainDragOver = this.value.htmlObject.querySelector(`div[data-index-main="${dragBefore}"]`);
        mainDragOver.style.background = '';
      },
      dragOver(evt){
        if (this.value.drag.action === 'resize') return;
        let dbe = evt.target;
        while (!dbe.getAttribute('data-index')) {
          dbe = dbe.parentElement;
        }

        this.value.drag.before = parseInt(dbe.getAttribute('data-index'));
        const mainDragOver = this.value.htmlObject.querySelector(`div[data-index-main="${this.value.drag.before}"]`);
        const centerX = mainDragOver.getBoundingClientRect().left + mainDragOver.offsetWidth / 2;
        let add = 0;
        if (centerX<evt.clientX) add = 1;
        const dif = this.value.drag.from - (this.value.drag.before + add)
        if ( dif>0 || dif<-1)
        {
          if (add===0) {
            mainDragOver.style.background='linear-gradient(90deg, silver, black)';
          } else {
            mainDragOver.style.background='linear-gradient(90deg, black, silver)';
          }
          this.value.drag.before = this.value.drag.before + add;
        } else {
          this.value.drag.before = -1;
          mainDragOver.style.background = '';
        }
      },
      dragResize: _.throttle( function(evt){
          if(evt.clientX !== 0)
          {
            let width = this.value.drag.startObjWidth + evt.clientX - this.value.drag.startX;
            if(width<60) width=60;
            this.$set(this.value.shells.value[this.value.drag.column], 'style',  `min-width: ${width}px; max-width: ${width}px;`);
            this.value.setRowWidth();
          }
        }, 50),
      dragResizeEnd(evt){
        this.value.drag.action = null;
      },
      dragResizeStart(evt){
        this.value.drag.action = 'resize';
        this.value.drag.startX = evt.clientX;
        const col = $(evt.target).closest('.v-t-col');
        this.value.drag.column = col.attr('data-column');

        this.value.drag.startObjWidth = col[0].offsetWidth;
      },
    },
    created(){
    },
    mounted() {
    },
    watch:{
      shellAssembled(n){
        if (n) {
          const wait = () => {
            const t = this;
            _.delay(
              ()=>{
                if (this.$refs.header){
                  this.value.htmlObject = this.$refs.header;
                  wait();
                }
              }
              , 100
            );
          };
          wait();
        }
      }
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .v-t-header {
    color: @table-header-text; background-color: @table-header-bg; padding: 5px 0;
    .v-t-col:first-child{
      div:first-child{margin-right: 5px;}
      >div{
        padding-left: 0;
      }
    }
    .v-t-col:last-of-type{
      border-right: none;
    }
    .v-t-col{
      >div{
        padding-left: 10px;
      }
      height: 100%;
      border-right: dotted 1px white;
      flex: 1 1 auto;
      position: relative;
      .h-c-tools {
        background-color: @table-header-bg;
        position: absolute;
        span {display: inline-block}
        max-width: 32px; min-width: 32px;
        right: 5px;
        .h-c-drag {
          display: inline-block; position: relative; height: 100%; min-width: 15px; min-height: 20px; cursor: move;  opacity: 0.5; margin-right: 2px;
          :hover {opacity: 1};
          span:first-child {
            font-size: 16px; margin: auto;
          }
          span:nth-child(2) {
            position: absolute;
            display: inline-block;
            top: 0;
            left: 6px;
            color: white;
            font-size: 10px;
            background-color: red;
            width: 10px;
            height: 10px;
            opacity: 1;
            border-radius: 4px;
            line-height: 10px;
          }
        }
        .h-c-sizing {
          min-width: 4px; cursor: col-resize; opacity: 0.5; margin-left: 2px;
          :hover {opacity: 1}
        }
        .h-c-options {
          &::v-deep .btn {padding: 2px !important;}
        }
      }
    }

    display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: nowrap;
    height: auto;
  }

</style>