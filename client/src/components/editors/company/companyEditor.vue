<template>
  <company-party
    v-if="step === 'party'"
    v-model="party"
  />
  <Address
    v-else-if="step === 'address'"
    v-model="address"
    :source="source"
  />
  <company
    v-else-if="step === 'company'"
    v-model="company"
  />
  <stores
    v-else-if="step === 'store'"
    v-model="stores"
    :address="address"
    :party="party"
    :source="source"
  />
  <confirm
    v-else
    v-model="confirmModel"
  />

</template>

<script>

  import CompanyParty from "./companyEditor/party";
  import Address from "./companyEditor/address";
  import Company from "./companyEditor/company";
  import Stores from "./companyEditor/stores";
  import Confirm from "./companyEditor/confirm";
  export default {
    name: "companyEditor",
    components: {Confirm, Stores, Company, Address, CompanyParty},
    props:{
      buttons: null,
      dadata: null,
      source: null,
      addressTemplate: {
        type: Object,
        default: () => { return {
          id: 0,
          address: '',
          json: null,
        } }
      },
      companyTemplate: {
        type: Object,
        default: () => { return {
          id:0,
          fact_address_id: 0,
          own:false,
          party_id: 0,
          phone:null,
          picture:null,
          with_vat:true,
        } }
      },
      partyTemplate: {
        type: Object,
        default: () => { return {
            id:0,
            inn:"",
            name:"",
            ogrn:"",
            json: null,
        } }
      },
      storeTemplate: {
        type: Object,
        default: () => { return {
          id: 0,
          name: '',
          phone: '',
          company_id: 0,
          address_id: 0,
          online: false,
          is_main: true,
          icon: '',
        } }
      },
    },
    data(){
      return{
        company: this.companyTemplate,
        party: this.partyTemplate,
        address: this.addressTemplate,
        stores: [],
        step: 'party',
      }
    },
    computed:{
      confirmModel(){
        return { company: this.company, party: this.party, address: this.address, stores: this.stores }
      },
      validator(){
        const party = this.party.name.length > 0 && (this.party.inn.length === 10 || this.party.inn.length === 12) && this.party.ogrn.length === 13;
        const address = this.address.id !== 0;
        const company = true;
        const store = true;
        let confirm = false;
        let _enter = party && address && company && store && confirm;
        return { party, address, company, store, confirm, _enter }
      }
    },
    methods:{
      back(){
        if (this.step === 'party') {
          this.buttons.addForm = false;
          this.buttons.back.enable = false;
          this.buttons.forward.enable = false;
        }
        else if (this.step === 'address') this.step = 'party';
        else if (this.step === 'company') this.step = 'address';
        else if (this.step === 'store') this.step = 'company';
        else if (this.step === 'confirm') this.step = 'store';
      },
      forward(){
        if (this.step === 'party') this.step = 'address';
        else if (this.step === 'address') this.step = 'company';
        else if (this.step === 'company') this.step = 'store';
        else if (this.step === 'store') this.step = 'confirm';
      },
      enter(){
        this.source.updateItem({ type: 'Party', item: this.party })
        .then(ans => {
          this.party.id = ans.data.id;
          this.company.party_id = ans.data.id;
          this.source.updateItem({ type: 'Company', item: this.company })
          .then(ans => {
            this.company.id = ans.data.id;
            _.forEach(this.stores, store => {
              store.company_id = this.company.id;
              this.source.updateItem({ type: 'Store', item: store })
            });

            const item = this.source.editor.row;
            item[this.source.editor.name] = this.company.id;
            this.source.updateItem({ type: this.source.type, item });
            this.buttons.close.action();
          })
        })
      }
    },
    created(){
      if (this.dadata) {
        this.party.json = this.dadata.data;
        this.party.name = this.dadata.value;
        this.party.inn = this.dadata.data.inn;
        this.party.ogrn = this.dadata.data.ogrn;

        const addr1 = this.dadata.data.address.unrestricted_value;
        const addr2 = this.dadata.data.address.value;
        this.address.json = this.dadata.data.address;
        this.address.address = addr1.length > addr2.length ? addr1 : addr2;

      }
    },
    mounted(){
      this.buttons.back = { enable: true, action: this.back };
      this.buttons.forward = { enable: this.validator[this.step], action: this.forward };

      this.buttons.enter = {enable: this.validator._enter, action: this.enter }
    },
    watch:{
      validator(n){
        this.buttons.forward.enable = n[this.step];
      },
      step(n){
        this.buttons.forward.enable = this.validator[n];
        this.buttons.enter.enable = n === 'confirm';
      },
      'address.id'(n){
         this.company.fact_address_id = n;
      }
    }
  }
</script>

<style scoped lang="less">
  @import "~@/less/_variables";

</style>