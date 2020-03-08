import _ from 'lodash';
import moment from 'moment';

export default {
    data() {
        return {
            rules: {
                isInteger: n => _.isInteger(_.toNumber(n)) || 'Введите целое число',
                isNumber: n => _.isNumber(_.toNumber(n)) || 'Введите число',
                required: v => !!v || 'Обязателный'
            }
        }
    },
    computed: {
        toCardsPossible() {
            return this.documentType
                && _.indexOf(['ORDER', 'INVOICE'], this.documentType) >= 0
                && this.document.id !== 0;
        },
    },
    methods: {
        dateFormat(date) {
            return moment(date).format('D/MM/Y');
        },
        changeRouteId(id) {
            const newRoute = _.pick(this.$route, ['name', 'params', 'query']);
            newRoute.params.id = id;
           return this.$router.replace(newRoute);
        },
        save(item, attr) {
            const validate = this[attr + 'Rules'].reduce((res, f) => res && f(item[attr]) === true, true);
            if (validate) {
                this.$store.dispatch(this.documentType + '/UPDATE_ITEM', {item})
                    .then((response) => {
                        const index = _.findIndex(this.items, { id: item.id });
                        this.items.splice(index, 1, response.data);
                    })
                    .catch(() => this.restore(item));
            } else {
                const error = this[attr + 'Rules'].reduce((res, f) =>
                    res === true ? f(item[attr]) : res, true
                );
                this.restore(item);
                this.$store.commit(
                    'SNACKBAR/SET',
                    { text: error, color: 'error', snackbar: 'true'},
                );
            }
        },
        restore(item) {
            const restore = this.$store.getters[this.documentType + '/CACHE'](item.id);
            const index = _.findIndex(this.items, { id: item.id });
            this.items.splice(index, 1, restore);
        },
    }
}