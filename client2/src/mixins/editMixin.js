import _ from 'lodash'

export default {
    data() {
        return {
            proxy: {},
        }
    },
    created() {
        this.proxy = _.cloneDeep(this.value);
    },
    watch: {
        value(v) {
            this.proxy = _.cloneDeep(v);
        }
    },
    methods: {
        save() {
            this.$store.dispatch(this.documentType + '/UPDATE_ITEM', { item: this.proxy })
                .then((response) => {
                    if (response.data.id !== this.proxy.id) {
                        this.$router.replace({ params: { id: response.data.id } });
                    }
                });
        }
    }
}