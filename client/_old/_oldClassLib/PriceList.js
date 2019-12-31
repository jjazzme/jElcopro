'use strict';

export default class PriceList {
    constructor(store){
        this._optics = null;
        this._data = [];
        this._currency = null;
        this._currencyRate = null;
        store.dispatch('TABLES/LOAD_REFDATA', 'Currency')
          .then(resp=>{this._currency = resp})
          .catch(err=>console.log(err));
        store.dispatch('TABLES/LOAD_REFDATA', 'CurrencyRate')
          .then(resp=>{this._currencyRate = resp})
          .catch(err=>console.log(err))
    }

    addData(newRaw){
        _.forEach(newRaw, row=>{
            if(row.id === 0){
                this._data.push(row);
            } else{
                const ind = _.findIndex(this._data, function (item) {
                    item.id === row.id
                });
                if (ind<0) {
                    this._data.push(row);
                } else {
                    if (Date.parse(row.actual)>Date.parse(item.actual)) {
                        this._data.splice(ind, 1, row)
                    }
                }
            }
        })
    }
    clearData(){
        this._data = []
    }

    get data(){

        const limit = this._optics.itemsLimit;
        const offset = 0;

        let ret = this._data.slice(offset, limit);
        _.forEach(ret, (row)=>{
            row.convertPrice =  function(val, curID){
                const rates = this._currencyRate;
                const cures = this._currency;
                let rur, usd;
                if (row.currency_id==='R01000'){
                    rur = row.our_price;
                    usd = row.our_price/_.find(rates, item=>item.currency_id==="R01235").rate
                } else if (row.currency_id==='R01235'){
                    rur = row.our_price*_.find(rates, item=>item.currency_id==="R01235").rate;
                    usd = row.our_price
                } else {
                    rur = row.our_price*_.find(rates, item=>item.currency_id==="R01235").rate/_.find(cures, item=>item.id===row.currency_id).nominal;
                    usd = rur/_.find(rates, item=>item.currency_id==="R01235").rate
                }
                return {rur: rur, usd:usd};
            }.bind({_currency: this._currency, _currencyRate: this._currencyRate})
        });
        return ret
    }

    get count(){
        return this._data.length
    }

    set optics(val){
        this._optics = val;
    }

}