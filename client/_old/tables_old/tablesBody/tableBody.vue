<template>
  <div ref="body">
    <div
      :style="rowStyle"
      v-for="(row, rowInd) in tableData"
      class="v-t-data-row"
      :key="rowInd"
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
          @change="value.basketChange(row.id)"
          :checked="value.basket.value.includes(row.id)"
        ></b-form-checkbox>
        <b-dropdown
          text=""
          size="sm"
        >
          <b-dropdown-item>
            <b-link
              :to="{name:'modelItem', params: {type: value.type, id:row.id}}"
              class="fa fa-pencil-square text-capitalize text-nowrap d-block"
            > {{value.shells.template[value.type].name.one}}: карта документа</b-link>
            <b-link
              @click="docToCard(rowInd)"
              v-if="['Invoice','Order'].includes(value.type)"
              class="fa fa-pencil-square text-nowrap d-block"
            >{{toCard[rowInd].text}}</b-link>
          </b-dropdown-item>
        </b-dropdown>
      </div>
      <div
        @contextmenu="editClick"
        v-for="(v2, k2) in row"
        :key="k2"
        :class="`v-t-col my-auto`"
        :style="value.style[k2]"
        :data-column="k2"
        v-show="value.shells.template[k2].show"
        v-if="value.shells.template[k2].hidden !== true"
      >
        <span
          @click="clickCell"
          :data-column="k2"
          :data-key="row.id"
          :class="`${ value.shells.template[k2].parentClass ? value.shells.template[k2].parentClass : '' } ${ value.shells.template[k2].to ? 'link' : '' }`"
          v-html="v2"
        ></span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "tableBody",
    data(){
      return {
        prevRender: {sou: null, ret: null},
      }
    },
    props: {
      value: null,
    },
    computed:{
      rowStyle(){return `${this.value.shells.width===0 ? 'width: auto' : `width: ${this.value.shells.width}px;` };`},
      tableData: {
        get(){
          const sou = this.value?.basket?.show
            ? this.value.data.basket
            : this.value?.data?.value?.rows
              ? this.value.data.value.rows
              : [];
          if (_.isEqual(this.prevRender.sou, sou)) return this.prevRender.ret;

          let ret = [];
          _.forEach(sou, (souRow)=>{
            let targetRow = {};
            _.forEach(souRow, (souVal, souKey)=>{
              //let val;
              const column = this.value.shells.initial[souKey];
              if (column){
                const html = column.html;
                targetRow[souKey] = html ? html(souRow) : souVal;
              }
            });
            ret.push(targetRow);
          });
          if (ret.length>0) this.$set( this.value, 'tableRenderPoint', Date.now() );
          this.prevRender.sou = sou;
          this.prevRender.ret = ret;
          return ret;
        },
      },
      toCard(){
        const type = this.value.type;
        let ret = [];
        const ids = type==='Invoice' ? [this.$store.getters['CARDS/GET_INVOICE'] ? this.$store.getters['CARDS/GET_INVOICE'].id : null] : _.map(this.$store.getters['CARDS/GET_ORDERS'], row=>row.id);
        const sellers = type==='Invoice' ? [] : _.map(this.$store.getters['CARDS/GET_ORDERS'], row=>row.sellerable_id);

        _.forEach(this.value.data.value.rows, row=>{
          let action, text;
          if (ids.includes(row.id)){
            action = 'remove';
            text = 'Удалить из карты'
          } else if (type==='Invoice' && ids[0] && ids[0] !== row.id){
            action = 'change';
            text = 'Заменить в карте'
          } else if (type==='Invoice' && !ids[0]){
            action = 'add';
            text = 'Добавить в карту'
          } else if (type==='Order' && sellers.includes(row.sellerable_id)){
            action = 'change';
            text = 'Заменить в картах'
          } else if (type==='Order' && !sellers.includes(row.sellerable_id)){
            action = 'add';
            text = 'Добавить в карты'
          }
          ret.push({action, text})
        });
        return ret;
      },
    },
    methods:{
      /*
      basketChange(id){
        const basket = this.value.basket.value;
        if( !basket.includes(id) ) basket.push(id);
        else basket.splice(basket.indexOf(id), 1);
      },
       */
      clickCell(e){
        const obj = e.target;
        if (!(obj.contentEditable==='true') && $(obj).hasClass('link')){
          const name = this.value.shells.template[$(obj).attr('data-column')].to.name;
          const params = {id: $(obj).attr('data-key')}; //<-------------
          this.$router.push({name: name, params: params});
        }
      },
      docToCard(ind){
        const type = this.value.type;
        if(type==='Invoice'){
          if(this.toCard[ind].action === 'remove'){
            this.$store.dispatch('CARDS/INVOICE_REMOVE')
          } else {
            this.$store.dispatch('CARDS/INVOICE_TO_CARD', this.value.data.value.rows[ind].id)
          }
        } else if(type==='Order'){
          if(this.toCard[ind].action === 'remove'){
            this.$store.dispatch('CARDS/ORDER_REMOVE', this.value.data.value.rows[ind].id)
          } else {
            this.$store.dispatch('CARDS/ORDER_TO_CARD', this.value.data.value.rows[ind].id)
          }
        }

        //this.$store.dispatch('CARDS/INVOICE_TO_CARD', id)
      },
      editClick(){},
    },
    mounted(){
      this.value.htmlObject = this.$refs.body
    },
    watch:{
      'value.tableRenderPoint'(n){
        if (n){
          const wait = () => {
            _.delay(()=>{
              if (this.$refs.body) {
                this.$set( this.value, 'htmlObject',  this.$refs.body );
                if ( !Object.values(this.value.shells.template)[0].style ) this.value.tableOptimization(40);
              }
              else wait();
            }, 100);
          };
          wait();
        }
      },
    }
  }
</script>

<style scoped lang="less">
  .v-t-data-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: nowrap;
    height: auto;
    border-left: solid 1px silver;
    border-right: solid 1px silver;
    border-bottom: solid 1px silver;
    .v-t-col{
      //flex-basis: 0;
      //flex-grow: 1;
      //max-width: 100%;
      flex: 1 1 auto;
      height: 100%;
      border-right: dotted 1px silver;
      padding: 3px 0 3px 10px;
      span{transition: 0.5s;}
      span.link:not([contenteditable=true]){color:navy; text-decoration: underline; cursor: pointer}
      span[contenteditable=true] {display: block}
      span{padding: 3px;}
    }
  }
  .v-t-data-row:hover{background-color: #f6f6f6}
  .v-t-col {

  }
</style>