<template>
  <main>
    <header>
      <h1>{{enums.loadingStatus.ShellLoaded}}</h1>
      <h2> Это заголовок 2</h2>
      <h3> Это заголовок 3</h3>
      <h4> Это заголовок 4</h4>
      <h5> Это заголовок 5</h5>
      <h6 @click="clickh"> RKBR </h6>

      <b-button @click="bigClick">ИЗМЕНИТЬ</b-button>
    </header>
    <article>
      <div id="test" :class="{ big: big }">
        Стандартный текст
        <p>dfgdgdf gdfgdgdgdf gdfgdfgdfgd gdfgdfdf dfgdfg dfgdfgdf gdfgdfgdfg dfgdfgdf bdfg dfdfbdfg dfdfgdfgdf
          gdfbdfb dfdfdfbdfdgd bd bdfb df bdf bdf bdf bdbdbdbdb sdfsfsd sdfsdfsdfsd fsdfsdfsdfsdfsfsdfsfd
          sdfsdfsdfsdfsd fsdsdfsdfsdfsd fsdfsdfsgfsdfsdfsdfsdfgsfdsdfsdfsdfdfsdfsdf
        </p>
        <p>
          ываыаыпы впывпыаып ывпывпыв <a href="//ya.ru">пывпывпывпыв пвыпвыпывывыывыв</a> ывпывпвпывпыв пвапвап ВАПВПВПВАП ВАПВАПВА ПАПВВАПВАВАП ВАПВ
          АРИКОЕВНОТЕВПО <b>ТГЛПРЛТНГЛТИПОТИРВМКПСЫМ</b> ТЬБЬИПАПРСЫ
        </p>

        <h1>В Калининграде полицейские в шутку разослали приказ с требованием вырезать снежинки. В наказание они делали снежинки для «всего МВД»</h1>

        <p>В Калининграде двое полицейских 8 декабря отправили своему коллеге из другого отдела МВД приказ, приуроченный к Новому году. «Требую… провести украшение помещений дежурной части снежинками из бумаги с расчетом 2 снежинки на 1 лист А4. Не менее пяти листов», — говорилось в приказе, якобы подписанном замглавы регионального МВД.</p>
        <p>Полицейских разоблачили. Руководитель вызвал их к себе и записал их объяснения на видео. Запись беседы опубликовал паблик «Омбудсмен полиции». Полицейские признались, что хотели пошутить над коллегой, а тот поверил им и, исполняя «приказ», вырезал снежинку. Затем этот коллега отправил снимок документа в местную группу в вайбере, «откуда информация ушла в неизвестном направлении». Уже 9 декабря фото приказа опубликовал «Омбудсмен полиции».</p>
        <p>В наказание полицейских заставили вырезать снежинки для своего отдела полиции. В ходе беседы с ними начальник рассказал, что из-за их шутки ему звонили из разных городов России. «Поактивнее, мы на все МВД должны нарезать снежинок, — заявил начальник. — Для Красноярска, для Сахалина, для Свердловска, для Саратова… Это откуда мне звонили вчера, — Для МВД, для ФСБ, прокуратуры. Кто только не увидел наше с вами письмо».</p>

        <h1>В Калининграде полицейские в шутку разослали приказ с требованием вырезать снежинки. В наказание они делали снежинки для «всего МВД»</h1>

        <p>В Калининграде двое полицейских 8 декабря отправили своему коллеге из другого отдела МВД приказ, приуроченный к Новому году. «Требую… провести украшение помещений дежурной части снежинками из бумаги с расчетом 2 снежинки на 1 лист А4. Не менее пяти листов», — говорилось в приказе, якобы подписанном замглавы регионального МВД.</p>
        <p>Полицейских разоблачили. Руководитель вызвал их к себе и записал их объяснения на видео. Запись беседы опубликовал паблик «Омбудсмен полиции». Полицейские признались, что хотели пошутить над коллегой, а тот поверил им и, исполняя «приказ», вырезал снежинку. Затем этот коллега отправил снимок документа в местную группу в вайбере, «откуда информация ушла в неизвестном направлении». Уже 9 декабря фото приказа опубликовал «Омбудсмен полиции».</p>
        <p>В наказание полицейских заставили вырезать снежинки для своего отдела полиции. В ходе беседы с ними начальник рассказал, что из-за их шутки ему звонили из разных городов России. «Поактивнее, мы на все МВД должны нарезать снежинок, — заявил начальник. — Для Красноярска, для Сахалина, для Свердловска, для Саратова… Это откуда мне звонили вчера, — Для МВД, для ФСБ, прокуратуры. Кто только не увидел наше с вами письмо».</p>

        <h1>В Калининграде полицейские в шутку разослали приказ с требованием вырезать снежинки. В наказание они делали снежинки для «всего МВД»</h1>

        <p>В Калининграде двое полицейских 8 декабря отправили своему коллеге из другого отдела МВД приказ, приуроченный к Новому году. «Требую… провести украшение помещений дежурной части снежинками из бумаги с расчетом 2 снежинки на 1 лист А4. Не менее пяти листов», — говорилось в приказе, якобы подписанном замглавы регионального МВД.</p>
        <p>Полицейских разоблачили. Руководитель вызвал их к себе и записал их объяснения на видео. Запись беседы опубликовал паблик «Омбудсмен полиции». Полицейские признались, что хотели пошутить над коллегой, а тот поверил им и, исполняя «приказ», вырезал снежинку. Затем этот коллега отправил снимок документа в местную группу в вайбере, «откуда информация ушла в неизвестном направлении». Уже 9 декабря фото приказа опубликовал «Омбудсмен полиции».</p>
        <p>В наказание полицейских заставили вырезать снежинки для своего отдела полиции. В ходе беседы с ними начальник рассказал, что из-за их шутки ему звонили из разных городов России. «Поактивнее, мы на все МВД должны нарезать снежинок, — заявил начальник. — Для Красноярска, для Сахалина, для Свердловска, для Саратова… Это откуда мне звонили вчера, — Для МВД, для ФСБ, прокуратуры. Кто только не увидел наше с вами письмо».</p>

      </div>
    </article>
    <page-environment
      :head="{title: {main: 'помощь'}}"
    />
  </main>
</template>

<script>
  import Enums from '../modules/enums'
  export default {
    data() {
      return{
        enums: new Enums(),
        big: false,
        pagenv:{
          title: 'Главная',
        },
      }
    },
    methods:{
      bigClick(){ this.big = !this.big },
      clickh(){
        var t = $('#test');
        // eslint-disable-next-line no-console
        console.log(t);
      },
    }
  }
</script>

<style scoped lang="less">
  .big{
    font-size: 2em;
    p{line-height: 200%}
  }
</style>