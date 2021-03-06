import _ from 'lodash';
import moment from 'moment';
require('moment/locale/ru');

export default {
    computed: {
        headers() {
            if (!this.documentType) return [];
            return this.$store.getters[this.documentType + '/HEADERS'];
            // if (_.indexOf(['ORDER', 'INVOICE'], this.documentType) >= 0 && headers[0].value !== 'inCard') {
            //    headers.unshift({ text: '', value: 'inCard', sortable: false })
            // }
            // return headers;
        },
        documentType() {
            return this.options.documentType ? _.toUpper(this.options.documentType) : null;
        }
    },
    watch: {
        options: {
            handler: _.debounce(function() {
                this.updateItems();
            }, 500),
            deep: true
        }
    },
    methods: {
        date(d) {
            return moment(d).format('LLL');
        },
        remove(item) {
            this.$store.dispatch(this.documentType + '/REMOVE_ITEM', item.id)
                .then(() => this.updateItems());
        },
        updateItems() {
            if (!this.documentType) return;
            this.loading = true;
            if (this.$route.query.page === this.options.page && !this.dependent) this.options.page = 1;
            this.$store.dispatch( this.documentType + '/GET_ITEMS', this.requestParams())
                .then((response) => {
                    this.total = response.data.count;
                    this.items = response.data.rows;
                    const newQuery = _.omit(this.options, ['filters', 'filterActions', 'scopes', 'documentType']);
                    if (!this.dependent && !_.isEqual(this.$route.query, newQuery)) {
                        this.$router.replace(
                            { name: this.$route.name, params: this.$route.params, query: newQuery }
                        );
                    }
                })
                // eslint-disable-next-line no-unused-vars
                .catch(() => {})
                .then(() => this.loading = false)
        },
        requestParams() {
            return this.options;
        }
    }
}