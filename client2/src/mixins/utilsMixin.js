import moment from 'moment';

export default {
    methods: {
        dateFormat(date) {
            return moment(date).format('D/MM/Y');
        },
    }
}