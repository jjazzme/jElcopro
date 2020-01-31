<template>
    <v-form>
        <v-container>
            <v-row>
                <v-col>
                    <v-menu
                            v-model="datePicker"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                    >
                        <template v-slot:activator="{ on }">
                            <v-text-field
                                    :value="dateFormat(document.date)"
                                    label="Дата"
                                    prepend-icon="mdi-calendar-edit"
                                    readonly
                                    v-on="on"
                            />
                        </template>
                        <v-date-picker v-model="document.date" @input="datePicker = false"></v-date-picker>
                    </v-menu>
                </v-col>
                <v-col>
                    <v-text-field v-model="document.number_prefix" label="Префикс"/>
                </v-col>
                <v-col>
                    <v-text-field v-model="document.number" label="Номер"/>
                </v-col>
                <v-col>
                    <company-select v-model="document.sellerable_id" label="Поставщик"/>
                </v-col>
                <v-col>
                    <company-select v-model="document.buyerable_id" label="Покупатель"/>
                </v-col>
                <v-col>
                    <store-select v-model="document.store_id" :company-id="document.buyerable_id" label="Склад"/>
                </v-col>
            </v-row>
        </v-container>
    </v-form>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import utilsMixin from '@/mixins/utilsMixin';
    import CompanySelect from '@/components/CompanySelect';
    import StoreSelect from '@/components/StoreSelect';

    export default {
        name: "DocumentEditor",
        components: {StoreSelect, CompanySelect},
        props: ['value'],
        mixins: [utilsMixin],
        data() {
            return {
                document: {},
                datePicker: false,
            }
        },
        created() {
            this.document = _.cloneDeep(this.value);
            this.document.date = moment(this.document.date).format('Y-MM-D');
        }
    }
</script>

<style scoped>

</style>