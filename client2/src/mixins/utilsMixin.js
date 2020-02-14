import _ from 'lodash';
import moment from 'moment';

export default {
    computed: {
        toCardsPossible() {
            return this.documentType
                && _.indexOf(['ORDER', 'INVOICE'], this.documentType) >= 0
                && this.document.id !== 0;
        }
    },
    methods: {
        dateFormat(date) {
            return moment(date).format('D/MM/Y');
        },
    }
}