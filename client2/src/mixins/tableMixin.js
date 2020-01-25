import _ from 'lodash';

export default {
    computed: {
        headers() {
            return this.documentType ? this.$store.getters[this.documentType + '/HEADERS'] : [];
        },
        documentType() {
            return this.options.documentType ? _.toUpper(this.options.documentType) : null;
        }
    },
    watch: {
        options: {
            handler: _.debounce(function() {
                if (!this.documentType) return;
                this.loading = true;
                if (this.$route.query.page === this.options.page && !this.dependent) this.options.page = 1;
                this.$store.dispatch( this.documentType + '/GET_ITEMS', this.options)
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
            }, 500),
            deep: true
        }
    },
}