<template>
  <div id="clock">
    <p class="date">{{ date }}</p>
    <p class="time">{{ time }}</p>
  </div>
</template>

<script>
  export default {
    name: "footerStandard",
    data(){
      return{
        time: '',
        date: '',
      }
    },
    mounted() {
      var week = ['ВСК', 'ПНД', 'ВТР', 'СРД', 'ЧТВ', 'ПТН', 'СБТ'];

      const updateTime = () => {
        var cd = new Date();
        this.time = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
        this.date = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth()+1, 2) + '-' + zeroPadding(cd.getDate(), 2) + ' ' + week[cd.getDay()];
      };

      const zeroPadding = function(num, digit) {
        var zero = '';
        for(var i = 0; i < digit; i++) {
          zero += '0';
        }
        return (zero + num).slice(-digit);
      };

      updateTime();
      var timerID = setInterval(updateTime, 60000);
    },
  }




</script>

<style scoped lang="less">
  @import "~@/less/_variables";
  p {
    margin: 0;
    padding: 0;
  }
  #clock {
    width: 100%;
    height: 100%;
    background-size: 100%;
    font-family: 'Share Tech Mono', monospace;
    text-align: center;
    position: absolute;
    padding-top: 0;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255,255,255,0.1);
    text-shadow: 0 0 20px rgba(10, 175, 230, 1),  0 0 20px rgba(10, 175, 230, 0);
    .time {
      height: 30%;
      letter-spacing: 0.05em;
      font-size: 42px;
      padding: 5px 0;
    }
    .date {
      letter-spacing: 0.1em;
      font-size: 24px;
    }
  }

</style>