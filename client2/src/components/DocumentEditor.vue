<template>
    <v-form class="mx-2">
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
                                :disabled="documentNotEditable"
                        />
                    </template>
                    <v-date-picker v-model="document.date" @input="datePicker = false"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col>
                <v-text-field v-model="document.number_prefix" label="Префикс" :disabled="documentNotEditable"/>
            </v-col>
            <v-col>
                <v-text-field v-model="document.number" label="Номер" :disabled="documentNotEditable"/>
            </v-col>
            <v-col>
                <document-transition :document="document" :disabled="!companyId"/>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <company-select
                        v-model="document.sellerable_id"
                        label="Поставщик"
                        :disabled="documentNotEditable"
                        :key="document.sellerable_id"
                        :filters="sellerableFilters"
                        :filter-actions="sellerableFilterActions"
                />
            </v-col>
            <v-col>
                <company-select
                        v-model="document.buyerable_id"
                        label="Покупатель"
                        :disabled="documentNotEditable"
                        :key="document.buyerable_id"
                        :filters="buyerableFilters"
                        :filter-acttions="buyerableFilterActions"
                />
            </v-col>
            <v-col>
                <store-select
                        v-model="document.store_id"
                        :company-id="companyId"
                        label="Склад"
                        :disabled="documentNotEditable || !companyId"
                />
            </v-col>
            <v-col>
                <currency-select v-model="document.currency_id" :disabled="documentNotEditable"/>
            </v-col>
        </v-row>
        <v-row>
            <v-col v-if="toCardsPossible && !documentNotEditable" class="ml-4">
                <v-btn v-if="inCards" @click="removeFromCards">
                    <v-icon>mdi-cart-minus</v-icon>
                    Удалить из карт
                </v-btn>
                <v-btn v-else @click="addToCards">
                    <v-icon>mdi-cart-plus</v-icon>
                    Добавить в карты
                </v-btn>
            </v-col>
            <v-col v-if="possibleChild">
                <v-btn @click="makeChild">
                    Создать дочерний
                </v-btn>
            </v-col>
            <v-col>
                <v-btn color="success" @click="save" :disabled="documentNotEditable">
                    <v-icon>mdi-content-save</v-icon>
                    Сохранить
                </v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import utilsMixin from '@/mixins/utilsMixin';
    import CompanySelect from '@/components/CompanySelect';
    import StoreSelect from '@/components/StoreSelect';
    import CurrencySelect from '@/components/CurrencySelect';
    import DocumentTransition from '@/components/DocumentTransition';

    export default {
        name: "DocumentEditor",
        components: {DocumentTransition, CurrencySelect, StoreSelect, CompanySelect},
        props: ['value'],
        mixins: [utilsMixin],
        data() {
            return {
                document: {},
                datePicker: false,
                child: {
                    INVOICE: 'TRANSFER-OUT',
                    ORDER: 'TRANSFER-IN'
                }
            }
        },
        created() {
            this.document = _.cloneDeep(this.value);
            this.document.date = moment(this.document.date).format('Y-MM-DD');
        },
        computed: {
            buyerableFilters() {
                if (this.document.document_type_id === 'invoice') return { own: 0 };
                if (this.document.document_type_id === 'order') return { own: 1 };
                return {};
            },
            buyerableFilterActions() {
                if (this.document.document_type_id === 'invoice' || this.document.document_type_id === 'order') {
                    return { own: false };
                }
                return {};
            },
            sellerableFilters() {
                if (this.document.document_type_id === 'order') return { own: 0 };
                if (this.document.document_type_id === 'invoice') return { own: 1 };
                return {};
            },
            sellerableFilterActions() {
                if (this.document.document_type_id === 'invoice' || this.document.document_type_id === 'order') {
                    return { own: false };
                }
                return {};
            },
            documentType() {
                return _.toUpper(this.document.document_type_id);
            },
            documentNotEditable() {
                if (_.indexOf(['order', 'invoice'], this.document.document_type_id) < 0) return true;
                return this.document.status_id !== 'formed';
            },
            companyId() {
                if (this.document.document_type_id === 'invoice') return this.document.sellerable_id ;
               return this.document.buyerable_id
            },
            inCards() {
                if (!this.document || _.indexOf(['invoice', 'order'], this.document.document_type_id) < 0) return false;
                if (
                    this.document.document_type_id === 'invoice' &&
                    this.$store.getters['USER/INVOICE'] &&
                    this.$store.getters['USER/INVOICE'].id === this.document.id
                ) {
                    return true;
                }
                return _.findIndex(this.$store.getters['USER/ORDERS'], { id: this.document.id })>=0;
            },
            possibleChild() {
                return this.child[this.documentType] && this.document.status_id === 'in_work';
            },
        },
        watch: {
            value(v) {
                this.document = _.cloneDeep(v);
                this.document.date = moment(this.document.date).format('Y-MM-DD');
            }
        },
        methods: {
            removeFromCards() {
                if (this.document.document_type_id === 'invoice') {
                    this.$store.dispatch('USER/CLEAR_INVOICE')
                } else {
                    this.$store.dispatch('USER/REMOVE_ORDER', this.document.id)
                }
            },
            addToCards() {
                if (this.document.document_type_id === 'invoice') {
                    this.$store.dispatch('USER/SET_INVOICE', this.document.id);
                } else {
                    this.$store.dispatch('USER/PUSH_ORDER', this.document.id);
                }
            },
            save() {
                this.$store.dispatch(this.documentType + '/UPDATE_ITEM', { item: this.document })
                    .then((response) => {
                        if (response.data.id !== this.document.id) {
                            this.$router.replace({ params: { id: response.data.id } });
                        }
                    });
            },
            makeChild() {
                this.$store.dispatch(
                    this.child[this.documentType] + '/UPDATE_ITEM' ,
                    { item: { id: 0, parent_id: this.document.id } }
                )
                    .then((response) => {
                        this.$router.push({
                            name: 'document',
                            params: { id: response.data.id, type: _.toLower(this.child[this.documentType])}
                        });
                    });
            }
        }
    }
</script>

<style scoped>

</style>