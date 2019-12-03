<template>
  <div class="p-l-line">
    <div
      class="p-l-delete"
      @click="deleteLine(value.id)"
    >
      <fa-icon icon="times" />
    </div>
    <div class="p-l-main">
      <div class="p-l-top">
        <div class="p-l-name">
          <div class="p-l-alias">Наименование</div>
          <div class="p-l-value">{{value.good ? value.good.product.name : '...'}}</div>
        </div>
        <div class="p-l-code">
          <div class="p-l-alias">Код</div>
          <div class="p-l-value">{{value.good ? value.good.code : '...'}}</div>
        </div>
        <div class="p-l-producer">
          <div class="p-l-alias">Производитель</div>
          <div class="p-l-value">...</div>
        </div>
        <div class="p-l-case">
          <div class="p-l-alias">Корпус</div>
          <div class="p-l-value">...</div>
        </div>
        <div class="p-l-quantity">
          <div class="p-l-alias">Количество</div>
          <div class="p-l-value">{{value.quantity}}</div>
        </div>
      </div>
      <div class="p-l-bottom">
        <div class="p-l-vat">
          <div class="p-l-alias">НДС</div>
          <div class="p-l-value">{{value.vat}}</div>
        </div>
        <div class="p-l-price-without-wat">
          <div class="p-l-alias">Цена без НДС</div>
          <div class="p-l-value">{{value.price_without_vat.toFixed(2)}}</div>
        </div>
        <div class="p-l-price-with-vat">
          <div class="p-l-alias">Цена с НДС</div>
          <div class="p-l-value">{{value.price_with_vat.toFixed(2)}}</div>
        </div>
        <div class="p-l-amount-without-vat">
          <div class="p-l-alias">Сумма без НДС</div>
          <div class="p-l-value">{{value.amount_without_vat.toFixed(2)}}</div>
        </div>
        <div class="p-l-amount-with-vat">
          <div class="p-l-alias">Сумма с НДС</div>
          <div class="p-l-value">{{value.amount_with_vat.toFixed(2)}}</div>
        </div>
        <div class="p-l-times">
          <div class="p-l-alias">Срок доставки</div>
          <div class="p-l-value">{{value.times}}</div>
        </div>
        <div class="p-l-remark">
          <div class="p-l-alias">Примечание</div>
          <div class="p-l-alias">{{value.remark}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "itemLinesLine",
    props: {
      value: null,
      env: null,
      ind: null,
    },
    methods: {
      deleteLine(lineId){
        const documentId = this.env.document.id;
        const type = this.env.shell.type;
        this.$store.dispatch('LOADER/removeLineFromDocument', { type, documentId, lineId })
      }
    },
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  .p-l-line{
    display: flex;
    border: @card-border;
    border-color: black;
    margin: 5px 0;
    .p-l-delete{
      max-width: 100px;
      min-width: 100px;
      flex: 1 1 auto;
      border-right: @card-border;
      text-align: center;
      line-height: 80px;
      color: red;
      font-size: 20px;
      cursor: pointer;
    }
    .p-l-main{
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      .p-l-top{border-bottom: @card-border;}
      .p-l-top, .p-l-bottom{
        height: 40px;
        flex: 1 1 auto;
        display: flex;
        >div{
          border-right: @card-border;
          min-width: 60px;
          position: relative;
          flex: 1 1 auto;
          .p-l-alias{
            font-size: 10px;
            color: rgba(0,0,0,0.5);
            position: absolute;
            top: 0;
            left: 5px;
          }
          .p-l-value{
            width: 100%;
            height: 100%;
            line-height: 40px;
            text-align: center;
          }
        }
        >div:last-of-type{border-right: none}
      }
    }
  }
</style>