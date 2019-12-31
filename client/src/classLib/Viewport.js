'use strict';

import Vue from 'vue';

export default class Viewport{
  constructor(mobileWidthPoint, bigWidthPoint){
    this.bigWidthPoint = bigWidthPoint;
    this.mobileWidthPoint = mobileWidthPoint;
    this.calculate();
    this.types = { mobile: 'mob', desktop: 'des', wide: 'wid' };
  }

  calculate(){
    document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);

    this.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    this.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    //Vue.set(this, 'width',  Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
    this.screenHeight = window.screen.availHeight;
    this.screenWidth = window.screen.availWidth;
    this.mainHeight = $('body > section > main').height();
    this.mainWidth = $('body > section > main').width();
  }

  get type(){
    if (this.width <= this.mobileWidthPoint) return 'mob';
    else if (this.width <= this.bigWidthPoint) return 'des';
    else return 'wid'
  }
}