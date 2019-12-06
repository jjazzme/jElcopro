export default (superclass) => class extends superclass {
    // eslint-disable-next-line no-unused-vars,class-methods-use-this
    async _closeTransition(params) {
        return true;
    }
};
