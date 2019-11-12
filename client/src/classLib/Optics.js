'use strict';

export default class Optics {
    constructor(current, previous){
        this.current = current;
        this.previous = previous;
    }


    get actualStoreOptics() {
        let ret = _.cloneDeep(this.current);
        const remove = this.current._forStore.remove;
        const transform = this.current._forStore.transform;

        Object.keys(ret).map(k=>{
            if (k.charAt(0)==='_') delete ret[k];
            if (remove.includes(k)) delete ret[k];
        });
        if(transform) ret = transform(ret);
        return ret;
    }

    get actualRouterOptics() {
        let ret = _.cloneDeep(this.current);
        const remove = this.current._forStore.remove;
        const transform = this.current._forStore.transform;

        Object.keys(ret).map(k=>{
            if (k.charAt(0)==='_') delete ret[k];
            if (remove.includes(k)) delete ret[k];
        });
        if(transform) ret = transform(ret);
        return ret;
    }

    isEquivalent(other){
        let isEqual = true;
        _.forEach(this.current._forCompare, compared=>{
            if(!compared.skip && !_.isEqual(this.current[compared.name], other[compared.name] )) isEqual = false;
        });
        return isEqual;
    }

    get isCurrentEquivalentPrevious(){
        return this.isEquivalent(this.previous);
    }

    get itemsLimit(){
        return (this.current._forView?.pageSize??0) *
          (this.current?._forView?.pages??0);
    }

    nextPage(){
        this.current._forView.pages++;
    }

    setPreviousByCurrent(){
        let previous = {};
        _.forEach(this.current, (value, key)=>{
            if(key.charAt(0) !== '_') previous[key] = value;
        });
        this.previous = previous;
    }

}