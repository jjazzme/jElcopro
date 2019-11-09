<template>
  <article>
    <page-environment
            :head="{title: {main: 'главная'}}"
    />
    <h1>{{enums.loadingStatus.ShellLoaded}}</h1>
    <h2> Это заголовок 2</h2>
    <h3> Это заголовок 3</h3>
    <h4> Это заголовок 4</h4>
    <h5> Это заголовок 5</h5>
    <h6 @click="clickh"> RKBR </h6>
    <div id="test">
      Стандартный текст
      <p>dfgdgdf gdfgdgdgdf gdfgdfgdfgd gdfgdfdf dfgdfg dfgdfgdf gdfgdfgdfg dfgdfgdf bdfg dfdfbdfg dfdfgdfgdf
        gdfbdfb dfdfdfbdfdgd bd bdfb df bdf bdf bdf bdbdbdbdb sdfsfsd sdfsdfsdfsd fsdfsdfsdfsdfsfsdfsfd
        sdfsdfsdfsdfsd fsdsdfsdfsdfsd fsdfsdfsgfsdfsdfsdfsdfgsfdsdfsdfsdfdfsdfsdf
      </p>
      <p>
        ываыаыпы впывпыаып ывпывпыв <a href="//ya.ru">пывпывпывпыв пвыпвыпывывыывыв</a> ывпывпвпывпыв пвапвап ВАПВПВПВАП ВАПВАПВА ПАПВВАПВАВАП ВАПВ
        АРИКОЕВНОТЕВПО <b>ТГЛПРЛТНГЛТИПОТИРВМКПСЫМ</b> ТЬБЬИПАПРСЫ
      </p>
    </div>
  </article>
</template>
<script>
  import Enums from '../../modules/enums'
  export default {
    data() {return{
      enums: new Enums(),
      pagenv:{
        title: 'Главная'
      },
    }},

    components:{

    },
    methods:{
      clickh(){
        var t = $('#test');
        // eslint-disable-next-line no-console
        console.log(t);
      },
    }
  }
</script>
