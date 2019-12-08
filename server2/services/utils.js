export default {
    getXlsxData: (z, worksheet) => {
        let stop = 0;
        for (let i = 0; i < z.length; i++) {
            if (!Number.isNaN(z[i])) {
                stop = i;
                break;
            }
        }
        return {
            col: z.substring(0, stop),
            row: parseInt(z.substring(stop), 0),
            value: worksheet[z].v,
        };
    },
};
