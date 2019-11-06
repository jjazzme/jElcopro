'use strict';

export default class PriceList {
    constructor(){
        this._data = [];
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
        return this._data
    }

}